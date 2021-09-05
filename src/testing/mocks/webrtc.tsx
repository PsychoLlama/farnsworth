enum SignalingState {
  Stable = 'stable',
  // ... incomplete
}

export class MockRTCPeerConnection {
  setRemoteDescription = jest.fn();
  setLocalDescription = jest.fn();
  createDataChannel = jest.fn(() => new MockRTCDataChannel());
  addTrack = jest.fn();

  signalingState = SignalingState.Stable;

  ontrack = null;
}

export class MockRTCDataChannel {
  // Empty
}
