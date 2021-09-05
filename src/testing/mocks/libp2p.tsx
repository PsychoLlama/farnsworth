export class Stream<T> {
  static from<T>(data: Array<T>) {
    return new Stream(data);
  }

  source: AsyncGenerator<T>;

  // Used in testing: called for every value piped to the sink.
  observer = jest.fn();

  constructor(data: Array<T> = []) {
    this.source = this.consume(data);
  }

  private async *consume(data: Array<T>) {
    for (const value of data) {
      yield value;
    }
  }

  sink = async <A,>(stream: AsyncIterable<A>) => {
    for await (const value of stream) {
      this.observer(value);
    }
  };
}

export default class MockLibp2p {
  static create() {
    return new MockLibp2p();
  }

  handle = jest.fn();
  start = jest.fn();

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  dialProtocol = jest.fn((addr: string, proto: string) => ({
    stream: new Stream(),
  }));

  peerId = {
    toB58String: jest.fn(() => 'mock-peer-id'),
  };
}
