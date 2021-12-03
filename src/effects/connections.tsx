import { multiaddr } from 'multiaddr';
import assert from '../utils/assert';
import context from '../conferencing/global-context';
import Libp2pMessenger from '../conferencing/libp2p-messenger';
import ConnectionManager from '../conferencing/webrtc';
import initNetworkingModule from '../conferencing/libp2p';

export const SIGNALING_PROTOCOL = '/webrtc/signal';

export function getConnectionById(peerId: string) {
  const conn = context.connections.get(peerId);
  assert(conn, `No such connection (id="${peerId}")`);

  return conn;
}

export async function listen(addr: string) {
  const [p2p, { default: sdk }] = await Promise.all([
    initNetworkingModule(addr),

    // Delayed import to avoid problems with circular dependencies.
    import('../utils/sdk'),
  ]);

  p2p.handle(SIGNALING_PROTOCOL, async ({ connection, stream }) => {
    const mgr = await ConnectionManager.create({
      localId: context.p2p.peerId.toB58String(),
      remoteId: connection.remotePeer.toB58String(),
      signaler: Libp2pMessenger.from(stream),
    });

    context.connections.set(mgr.remoteId, mgr);
    sdk.connections.accept(mgr.remoteId);
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

  const mgr = await ConnectionManager.create({
    localId: context.p2p.peerId.toB58String(),
    remoteId: multiaddr(addr).getPeerId(),
    signaler: Libp2pMessenger.from(connection.stream),
  });

  context.connections.set(mgr.remoteId, mgr);

  return {
    peerId: mgr.remoteId,
  };
}

// Permanently close a peer connection.
export function close(peerId: string) {
  const conn = getConnectionById(peerId);
  conn.close();

  return peerId;
}
