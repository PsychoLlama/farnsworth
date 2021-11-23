export default class PeerId {
  static create = jest.fn(async () => new PeerId());
  static createFromJSON = jest.fn(() => new PeerId());

  toB58String() {
    return 'mock-peer-id';
  }

  toJSON() {
    return { mock: 'peer-id' };
  }
}
