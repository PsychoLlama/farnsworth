import Libp2pMessenger from '../libp2p-messenger';
import {
  RtcDescriptionType,
  RtcSignalingState,
  STUN_SERVERS,
} from '../../utils/constants';
import Logger from '../../utils/logger';
import DataChannelMessenger from './data-channel-messenger';

const logger = new Logger('ConnectionManager');

/**
 * Manages WebRTC signaling over libp2p channels.
 *
 * Signaling follows the Perfect Negotiation pattern which is more robust in
 * the case of reconnect compared to caller/callee assignments. See:
 * https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation
 *
 * Forgive the constructor side effects.
 */
export default class ConnectionManager {
  private polite: boolean;
  private signaler: Libp2pMessenger;
  private pc: RTCPeerConnection;
  private makingOffer = false;
  private ignoreIceErrors = false;

  remoteId: string;
  messenger: DataChannelMessenger;

  constructor({ localId, remoteId, signaler }: Config) {
    this.signaler = signaler;
    this.remoteId = remoteId;

    // 'polite' determines who backs down in a signaling conflict.
    this.polite = localId < remoteId;

    logger.debug('Opening WebRTC connection:', `${localId} => ${remoteId}`);
    logger.debug(`Signaling mode is '${this.polite ? 'polite' : 'impolite'}'`);

    this.signaler.subscribe(this.processMessage);
    this.pc = new RTCPeerConnection(DEFAULT_PC_CONFIG);
    this.pc.ontrack = this.emitTrackEvent;
    this.pc.onicecandidate = this.sendIceCandidate;
    this.pc.onnegotiationneeded = this.updateLocalSession;

    // Side effect: logs connection state changes.
    IceLogger.observe(this.pc);

    // Side effect: triggers connection setup. Register event handlers first.
    this.messenger = new DataChannelMessenger({
      pc: this.pc,
      remoteId,
    });
  }

  /**
   * Send an audio/video track to the remote peer, received under
   * `pc.ontrack`.
   */
  addTrack(track: MediaStreamTrack) {
    logger.debug(`Adding ${track.kind} track`);
    this.pc.addTrack(track);
  }

  /**
   * Permanently closes the peer connection. The 'close' event fires on the
   * remote data channel.
   */
  close() {
    logger.debug('Closing peer connection');
    this.pc.close();
  }

  private emitTrackEvent = async ({ track }: RTCTrackEvent) => {
    logger.debug(`Incoming remote ${track.kind} track`);

    const { default: sdk } = await import('../../utils/sdk');
    sdk.tracks.add({ track, peerId: this.remoteId });
  };

  private sendIceCandidate = ({ candidate }: RTCPeerConnectionIceEvent) => {
    const msg: Message = { type: MessageType.IceCandidate, payload: candidate };
    logger.debug('Sending ICE candidate:', candidate?.candidate);
    this.signaler.send(msg);
  };

  private updateLocalSession = async () => {
    // Used to detect conflicts (two people calling each other).
    this.makingOffer = true;

    try {
      await this.pc.setLocalDescription();
    } finally {
      this.makingOffer = false;
    }

    const payload = this.pc.localDescription;
    const msg: Message = { type: MessageType.SessionDescription, payload };
    logger.debug(`Sending session description '${payload.type}'`);

    this.signaler.send(msg);
  };

  private processMessage = async (message: Message) => {
    if (!message) return; // Sanity check the message.

    switch (message.type) {
      case MessageType.SessionDescription: {
        logger.debug(`Receiving session description '${message.payload.type}'`);
        return this.processRemoteSessionDescription(message.payload);
      }

      case MessageType.IceCandidate: {
        try {
          logger.debug('Receiving ICE candidate:', message.payload?.candidate);
          await this.pc.addIceCandidate(message.payload);
        } catch (error) {
          if (this.ignoreIceErrors) {
            logger.warn('Ignoring ICE error (follows offer conflict)', error);
          } else {
            throw error;
          }
        }
      }
    }
  };

  private async processRemoteSessionDescription(desc: RTCSessionDescription) {
    const conflictingOffer =
      desc.type === RtcDescriptionType.Offer &&
      (this.makingOffer || this.pc.signalingState !== RtcSignalingState.Stable);

    // The "polite" peer will rollback their offer and turn into a receiver.
    if (conflictingOffer) {
      logger.warn('Received conflicting offer');

      if (!this.polite) {
        this.ignoreIceErrors = true;
        logger.debug('Ignoring conflict (impolite mode)');
        return;
      } else {
        logger.debug('Resolving conflict, generating answer (polite mode)');
      }
    }

    await this.pc.setRemoteDescription(desc);

    if (desc.type === RtcDescriptionType.Offer) {
      await this.pc.setLocalDescription();
      const msg: Message = {
        type: MessageType.SessionDescription,
        payload: this.pc.localDescription,
      };

      logger.debug(`Answering other peer's offer`);
      this.signaler.send(msg);
    }
  }
}

export class IceLogger {
  private pc: RTCPeerConnection;
  private oldIceConnectionState: RTCIceConnectionState;
  private successStates: Set<RTCIceConnectionState> = new Set([
    'connected' as const,
    'completed' as const,
  ]);

  static observe(pc: RTCPeerConnection) {
    return new IceLogger(pc);
  }

  constructor(pc: RTCPeerConnection) {
    this.pc = pc;

    this.oldIceConnectionState = this.pc.iceConnectionState;
    this.pc.addEventListener(
      'iceconnectionstatechange',
      this.observeIceConnectionState,
    );
  }

  private observeIceConnectionState = () => {
    this.logIceConnectionState(
      this.oldIceConnectionState,
      this.pc.iceConnectionState,
    );

    this.oldIceConnectionState = this.pc.iceConnectionState;
  };

  private logIceConnectionState(
    previous: RTCIceConnectionState,
    current: RTCIceConnectionState,
  ) {
    switch (current) {
      case 'checking':
        return logger.debug('Testing remote candidates...');
      case 'disconnected':
        return logger.warn(`Disconnected.`);
      case 'failed':
        return logger.error('Connection failed.');
      case 'closed':
        return logger.debug('Connection closed.');
    }

    // Under rare circumstances, it's possible to transition from 'checking'
    // directly to 'completed', skipping 'connected'. Don't log twice.
    if (!this.successStates.has(previous) && this.successStates.has(current)) {
      logger.debug('Connection successful.');
    }
  }
}

export interface Config {
  localId: string;
  remoteId: string;
  signaler: Libp2pMessenger;
}

export enum MessageType {
  IceCandidate = 'ice-candidate',
  SessionDescription = 'session-description',
}

type Message =
  | { type: MessageType.IceCandidate; payload: RTCIceCandidate }
  | { type: MessageType.SessionDescription; payload: RTCSessionDescription };

const DEFAULT_PC_CONFIG = {
  iceServers: STUN_SERVERS.map((addr: string) => ({
    urls: `stun:${addr}`,
  })),
};

declare global {
  interface RTCPeerConnection {
    // TypeScript doesn't recognize the implicit form. Without parameters, the
    // peer connection infers the correct description from the local signaling
    // state. This is recommended by modern browsers.
    setLocalDescription(): Promise<void>;
  }
}
