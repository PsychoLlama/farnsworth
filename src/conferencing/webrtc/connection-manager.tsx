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

  constructor({ localId, remoteId, signaler, events }: Config) {
    this.signaler = signaler;
    this.events = events;
    this.remoteId = remoteId;

    // 'polite' determines who backs down in a signaling conflict.
    this.polite = localId < remoteId;

    this.pc = new RTCPeerConnection(DEFAULT_PC_CONFIG);
    this.pc.ontrack = this.emitTrackEvent;
  }

  async connect() {
    const channel = this.pc.createDataChannel('app', {
      negotiated: true,
      id: 0,
    });

    return channel;
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
}

export interface Config {
  localId: string;
  remoteId: string;
  signaler: Libp2pMessenger;
  events: {
    onTrack({ track: MediaStreamTrack, peerId: string }): unknown;
  };
}

const DEFAULT_PC_CONFIG = {
  // TODO: Make this customizable.
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};
