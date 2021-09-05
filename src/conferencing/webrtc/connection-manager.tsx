import Libp2pMessenger from '../libp2p-messenger';

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
  channel: RTCDataChannel;

  constructor({ localId, remoteId, signaler, events }: Config) {
    this.signaler = signaler;
    this.events = events;
    this.remoteId = remoteId;

    // 'polite' determines who backs down in a signaling conflict.
    this.polite = localId < remoteId;

    this.pc = new RTCPeerConnection(DEFAULT_PC_CONFIG);
    this.pc.ontrack = this.emitTrackEvent;
    this.pc.onicecandidate = this.sendIceCandidate;
    this.pc.onnegotiationneeded = this.negotiateSessionDescription;

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
    this.signaler.send({
      type: MessageType.IceCandidate,
      payload: candidate,
    });
  };

  private negotiateSessionDescription = async () => {
    await this.pc.setLocalDescription();
    this.signaler.send({
      type: MessageType.SessionDescription,
      payload: this.pc.localDescription,
    });
  };
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
