/* eslint-disable @typescript-eslint/no-explicit-any */
import pipe from 'it-pipe';

/**
 * Provides a simple JSON messenger interface over libp2p streams.
 */
export default class Libp2pMessenger<Stream> {
  static from<Stream>(stream: Stream) {
    return new Libp2pMessenger(stream);
  }

  private stream: Stream;

  private constructor(stream: Stream) {
    this.stream = stream;
  }

  async send<Stream>(data: Stream) {
    await pipe([data], json.encode, this.stream);
  }

  subscribe<Callback extends (msg: any) => any>(callback: Callback) {
    return pipe(
      this.stream,
      json.decode,
      async (stream: AsyncIterable<Parameters<Callback>[0]>) => {
        for await (const value of stream) {
          callback(value);
        }
      },
    );
  }
}

// Stream-oriented JSON encoding/decoding.
const json = {
  async *encode(stream: AsyncIterable<any>) {
    for await (const value of stream) {
      yield JSON.stringify(value);
    }
  },

  async *decode(stream: AsyncIterable<string>) {
    for await (const value of stream) {
      yield JSON.parse(value);
    }
  },
};
