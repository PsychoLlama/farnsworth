export default class MockLibp2p {
  static create() {
    return new MockLibp2p();
  }

  start = jest.fn();

  peerId = {
    toB58String: jest.fn(() => 'mock-peer-id'),
  };
}
