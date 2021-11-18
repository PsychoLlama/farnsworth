import EventEmitter from 'events';
import { RtcSignalingState } from '../../utils/constants';

export class MockRTCPeerConnection {
  setRemoteDescription = jest.fn();
  setLocalDescription = jest.fn();
  addIceCandidate = jest.fn();
  addTrack = jest.fn();
  close = jest.fn();
  createDataChannel = jest.fn(
    (label, options) => new MockRTCDataChannel(label, options),
  );

  signalingState = RtcSignalingState.Stable;
  localDescription = { mock: 'local-description' };

  ontrack = null;
  onicecandidate = null;
  onnegotiationneeded = null;
}

export class MockRTCDataChannel extends EventEmitter implements RTCDataChannel {
  label: string;
  id: number | null;
  negotiated: boolean;
  ordered: boolean;
  protocol: string;

  constructor(
    label: string,
    { negotiated, id, protocol, ordered }: RTCDataChannelInit = {},
  ) {
    super();
    this.label = label;
    this.negotiated = negotiated ?? false;
    this.id = id ?? null;
    this.protocol = protocol ?? '';
    this.ordered = ordered ?? true;
  }

  bufferedAmountLowThreshold = 0;
  bufferedAmount = 0;
  maxPacketLifeTime = null;
  maxRetransmits = null;
  binaryType: BinaryType = 'blob';
  readyState: RTCDataChannelState = 'connecting';

  close = jest.fn();
  send = jest.fn();
  addEventListener = this.on;
  removeEventListener = this.off;

  onerror = null;
  onclose = null;
  onopen = null;
  onmessage = null;
  onbufferedamountlow = null;

  // --- unimplemented ---
  dispatchEvent = jest.fn();
}
