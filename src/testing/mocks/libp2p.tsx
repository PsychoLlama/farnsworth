import { MuxedStream } from 'libp2p';

export class Stream<T> implements MuxedStream {
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

  sink = async (source: Uint8Array) => {
    for await (const value of source) {
      this.observer(value);
    }
  };

  close = jest.fn();
  abort = jest.fn();
  reset = jest.fn();
  timeline = null;
  id = 'mock-id';

  // -- Stubbed for MuxedStream --
  [Symbol.asyncIterator] = () => this.consume([]);
}

export default class MockLibp2p {
  static create() {
    return new MockLibp2p();
  }

  handle = jest.fn((proto, handler) => {
    this.mock.protocols.set(proto, handler);
  });

  start = jest.fn();

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  dialProtocol = jest.fn((addr: string, proto: string) => ({
    stream: new Stream(),
  }));

  peerId = {
    toB58String: jest.fn(() => 'mock-peer-id'),
  };

  // Purely used for testing.
  mock = {
    protocols: new Map(),
    simulateRequest: (protocol: string, args: unknown) => {
      const handler = this.mock.protocols.get(protocol);

      return handler(args);
    },
  };
}
