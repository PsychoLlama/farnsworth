/**
 * Provides just enough type information to make the compiler agree with us.
 * Several libp2p modules already have type exports so I expect these stubs
 * will become obsolete soon.
 */

declare module 'libp2p-websockets' {
  import { Connection, Multiaddr } from 'libp2p';
  import EventEmitter from 'events';

  class Listener extends EventEmitter {
    listen(addr: Multiaddr): Promise<void>;
    getAddrs(): Array<Multiaddr>;
    close(): Promise<void>;
  }

  export default class Websockets {
    dial(addr: Multiaddr): Promise<Connection>;
    filter(addrs: Array<Multiaddr>): Array<Multiaddr>;
    createListener(): Listener;
  }
}

declare module 'libp2p-websockets/src/filters' {
  // Not technically accurate, but it doesn't have to be.
  export function all(): true;
}

declare module 'libp2p-mplex' {
  import { MuxedStream } from 'libp2p';

  export default class MPLEX {
    static multicodec: string;
    readonly streams: Array<MuxedStream>;
    newStream(): MuxedStream;
    onStream(stream: MuxedStream): void;
    onStreamEnd(stream: MuxedStream): void;
  }
}
