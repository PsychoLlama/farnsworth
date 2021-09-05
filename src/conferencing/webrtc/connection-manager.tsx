import Libp2pMessenger from '../libp2p-messenger';
import { RtcDescriptionType, RtcSignalingState } from '../../utils/constants';

/**
 * Manages WebRTC signaling over libp2p channels. Tracks and data channels are
 * emitted as events.
 *
 * Signaling follows the Perfect Negotiation pattern. See:
 * https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation
 *
 * TODO: Automatically detect disconnect and restart ICE signaling.
 */
export default class ConnectionManager {
  private polite: boolean;
  private signaler: Libp2pMessenger;
  private events: Config['events'];
  private pc: RTCPeerConnection;
  private remoteId: string;
  private makingOffer = false;
  private ignoreIceErrors = false;
  channel: RTCDataChannel;

  constructor({ localId, remoteId, signaler, events }: Config) {
    this.signaler = signaler;
    this.events = events;
    this.remoteId = remoteId;

    // 'polite' determines who backs down in a signaling conflict.
    this.polite = localId < remoteId;

    this.signaler.subscribe(this.processMessage);
    this.pc = new RTCPeerConnection(DEFAULT_PC_CONFIG);
    this.pc.ontrack = this.emitTrackEvent;
    this.pc.onicecandidate = this.sendIceCandidate;
    this.pc.onnegotiationneeded = this.updateLocalSession;

    // Side effect: triggers connection setup. Register event handlers first.
    this.channel = this.pc.createDataChannel('app', {
      negotiated: true,
      id: 0,
    });
  }

  /**
   * Send an audio/video track to the remote peer, received under
   * `events.onTrack`.
   */
  addTrack(track: MediaStreamTrack) {
    this.pc.addTrack(track);
  }

  private emitTrackEvent = ({ track }: RTCTrackEvent) => {
    this.events.onTrack({ track, peerId: this.remoteId });
  };

  private sendIceCandidate = ({ candidate }: RTCPeerConnectionIceEvent) => {
    const msg: Message = { type: MessageType.IceCandidate, payload: candidate };
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
    this.signaler.send(msg);
  };

  private processMessage = async (message: Message) => {
    if (!message) return; // Sanity check the message.

    switch (message.type) {
      case MessageType.SessionDescription: {
        return this.processRemoteSessionDescription(message.payload);
      }

      case MessageType.IceCandidate: {
        try {
          await this.pc.addIceCandidate(message.payload);
        } catch (error) {
          if (!this.ignoreIceErrors) throw error;
        }
      }
    }
  };

  private async processRemoteSessionDescription(desc: RTCSessionDescription) {
    const conflictingOffer =
      desc.type === RtcDescriptionType.Offer &&
      (this.makingOffer || this.pc.signalingState !== RtcSignalingState.Stable);

    // The "polite" peer will rollback their offer and turn into a receiver.
    if (conflictingOffer && !this.polite) {
      this.ignoreIceErrors = true;
      return;
    }

    await this.pc.setRemoteDescription(desc);

    if (desc.type === RtcDescriptionType.Offer) {
      await this.pc.setLocalDescription();
      const msg: Message = {
        type: MessageType.SessionDescription,
        payload: this.pc.localDescription,
      };

      this.signaler.send(msg);
    }
  }
}

export interface Config {
  localId: string;
  remoteId: string;
  signaler: Libp2pMessenger;
  events: {
    onTrack({ track: MediaStreamTrack, peerId: string }): unknown;
  };
}

export enum MessageType {
  IceCandidate = 'ice-candidate',
  SessionDescription = 'session-description',
}

type Message =
  | { type: MessageType.IceCandidate; payload: RTCIceCandidate }
  | { type: MessageType.SessionDescription; payload: RTCSessionDescription };

const DEFAULT_PC_CONFIG = {
  // TODO: Make this customizable.
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

declare global {
  interface RTCPeerConnection {
    // TypeScript doesn't recognize the implicit form. Without parameters, the
    // peer connection infers the correct description from the local signaling
    // state. This is recommended by modern browsers.
    setLocalDescription(): Promise<void>;
  }
}
