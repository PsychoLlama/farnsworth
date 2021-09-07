import P2P from 'libp2p';
import { NOISE } from 'libp2p-noise';
import MPLEX from 'libp2p-mplex';
import Websockets from 'libp2p-websockets';
import * as filters from 'libp2p-websockets/src/filters';
import assert from 'assert';
import context from '../conferencing/global-context';
import Libp2pMessenger from '../conferencing/libp2p-messenger';
import ConnectionManager from '../conferencing/webrtc';
import { multiaddr } from 'multiaddr';

export const SIGNALING_PROTOCOL = '/webrtc/signal';

/**
 * Signaling works in two parts: First, we connect to the relay server and
 * tell them who we're looking for. Second, the relay server tells us when
 * that peer joins and we establish a relayed connection to them.
 */
async function initNetworkingModule(addr: string) {
  assert(!context.p2p, 'libp2p is already initialized.');

  const p2p = await P2P.create({
    addresses: {
      listen: [`${addr}/p2p-circuit`],
    },
    modules: {
      transport: [Websockets],
      connEncryption: [NOISE],
      streamMuxer: [MPLEX],
    },
    config: {
      transport: {
        [ModuleId.Websockets]: {
          filter: filters.all,
        },
      },
    },
  });

  // Other effects depend on this singleton.
  context.p2p = p2p;

  return p2p;
}

export async function listen(addr: string) {
  const p2p = await initNetworkingModule(addr);

  p2p.handle(SIGNALING_PROTOCOL, async ({ connection, stream }) => {
    const mgr = new ConnectionManager({
      localId: context.p2p.peerId.toB58String(),
      remoteId: connection.remotePeer.toB58String(),
      signaler: Libp2pMessenger.from(stream),
      events: {
        onTrack: console.log,
      },
    });

    context.connections.set(mgr.remoteId, mgr);
  });

  await p2p.start();

  return {
    id: p2p.peerId.toB58String(),
    relayAddr: addr,
  };
}

// Call another peer
export async function dial(addr: string) {
  assert(context.p2p, 'libp2p is not ready.');
  const connection = await context.p2p.dialProtocol(addr, SIGNALING_PROTOCOL);

  const mgr = new ConnectionManager({
    localId: context.p2p.peerId.toB58String(),
    remoteId: multiaddr(addr).getPeerId(),
    signaler: Libp2pMessenger.from(connection.stream),
    events: {
      onTrack: console.log,
    },
  });

  context.connections.set(mgr.remoteId, mgr);
}

const ModuleId = {
  Websockets: Websockets.prototype[Symbol.toStringTag],
};
