import { RtcSignalingState } from '../../utils/constants';

export class MockRTCPeerConnection {
  setRemoteDescription = jest.fn();
  setLocalDescription = jest.fn();
  addIceCandidate = jest.fn();
  createDataChannel = jest.fn(() => new MockRTCDataChannel());
  addTrack = jest.fn();

  signalingState = RtcSignalingState.Stable;
  localDescription = { mock: 'local-description' };

  ontrack = null;
  onicecandidate = null;
  onnegotiationneeded = null;
}

export class MockRTCDataChannel {
  // Empty
}
