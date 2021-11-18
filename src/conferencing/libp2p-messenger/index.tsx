/* eslint-disable @typescript-eslint/no-explicit-any */
import pipe from 'it-pipe';
import { MuxedStream } from 'libp2p';
import AsyncQueue from './async-queue';

/**
 * Provides a simple JSON messenger interface over libp2p streams.
 */
export default class Libp2pMessenger {
  static from(stream: MuxedStream) {
    return new Libp2pMessenger(stream);
  }

  private stream: MuxedStream;
  private messageQueue = new AsyncQueue();
  private connectionClosePromise: Promise<void>;

  private constructor(stream: MuxedStream) {
    this.stream = stream;
    this.connectionClosePromise = pipe(
      this.messageQueue,
      json.encode,
      this.stream,
    );
  }

  /**
   * Send arbitrary JSON to the other side.
   */
  async send(data: unknown) {
    this.messageQueue.append(data);
  }

  /**
   * Invokes the callback for every new message.
   * WARNING: Don't subscribe more than once.
   */
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

  /**
   * Close the message queue and wait for the pipes to drain.
   */
  drain() {
    this.messageQueue.end();
    return this.connectionClosePromise;
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
