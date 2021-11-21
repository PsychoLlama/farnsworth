import EventEmitter from 'events';
import { RtcSignalingState } from '../../utils/constants';

export class MockRTCPeerConnection
  extends EventEmitter
  implements RTCPeerConnection
{
  setRemoteDescription = jest.fn();
  setLocalDescription = jest.fn();
  addIceCandidate = jest.fn();
  addTrack = jest.fn();
  removeTrack = jest.fn();
  restartIce = jest.fn();
  close = jest.fn();
  createDataChannel = jest.fn(
    (label, options) => new MockRTCDataChannel(label, options),
  );

  signalingState = RtcSignalingState.Stable;
  canTrickleIceCandidates = true;
  iceConnectionState = 'new' as RTCIceConnectionState;
  iceGatheringState = 'new' as RTCIceGatheringState;
  connectionState = 'new' as RTCPeerConnectionState;
  localDescription: RTCSessionDescription = {
    type: 'offer' as const,
    sdp: '<mock-session-description>',
    toJSON: jest.fn(),
  };

  ontrack = null;
  onicecandidate = null;
  onnegotiationneeded = null;
  onconnectionstatechange = null;
  onsignalingstatechange = null;
  onicegatheringstatechange = null;
  oniceconnectionstatechange = null;
  onicecandidateerror = null;
  ondatachannel = null;

  addEventListener = this.on;
  removeEventListener = this.off;

  // --- unimplemented ---
  remoteDescription = null;
  currentLocalDescription = null;
  currentRemoteDescription = null;
  pendingLocalDescription = null;
  pendingRemoteDescription = null;

  addTransceiver = jest.fn();
  createOffer = jest.fn();
  createAnswer = jest.fn();
  getConfiguration = jest.fn();
  setConfiguration = jest.fn();
  getTransceivers = jest.fn();
  getReceivers = jest.fn();
  getSenders = jest.fn();
  getStats = jest.fn();

  dispatchEvent = jest.fn();
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
