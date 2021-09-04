export default class MockLibp2p {
  static create() {
    return new MockLibp2p();
  }

  handle = jest.fn();
  start = jest.fn();
  dialProtocol = jest.fn();

  peerId = {
    toB58String: jest.fn(() => 'mock-peer-id'),
  };
}
