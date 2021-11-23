import P2P from 'libp2p';
import { NOISE } from 'libp2p-noise';
import MPLEX from 'libp2p-mplex';
import WebSockets from 'libp2p-websockets';
import * as filters from 'libp2p-websockets/src/filters';
import assert from 'assert';
import PeerId, { JSONPeerId } from 'peer-id';
import localforage from 'localforage';
import context from './global-context';
import { STORAGE_KEY_PEER_ID } from '../utils/constants';
import Logger from '../utils/logger';

const logger = new Logger('libp2p');

/**
 * Signaling works in two parts: First, we connect to the relay server and
 * tell them who we're looking for. Second, the relay server tells us when
 * that peer joins and we establish a relayed connection to them.
 */
export default async function initNetworkingModule(signalingServer: string) {
  assert(!context.p2p, 'libp2p is already initialized.');

  const p2p = await P2P.create({
    peerId: await loadPeerId(),
    addresses: {
      listen: [`${signalingServer}/p2p-circuit`],
    },
    modules: {
      transport: [WebSockets],
      connEncryption: [NOISE],
      streamMuxer: [MPLEX],
    },
    config: {
      transport: {
        [ModuleId.WebSockets]: {
          filter: filters.all,
        },
      },
    },
  });

  // Other effects depend on this singleton.
  context.p2p = p2p;

  return p2p;
}

/**
 * The peer ID is used as a unique identifier for the people you call. If it
 * changes between each session, it's really annoying for the user.
 *
 * We save the peer ID in browser storage to keep it consistent between
 * calls.
 */
export async function loadPeerId() {
  const persistedPeerId: null | JSONPeerId = await localforage.getItem(
    STORAGE_KEY_PEER_ID,
  );

  if (persistedPeerId) {
    const peerId = await PeerId.createFromJSON(persistedPeerId);
    logger.debug('Restored peer ID:', peerId.toB58String());

    return peerId;
  }

  logger.debug('Creating a new peer ID');
  const peerId = await PeerId.create();
  await localforage.setItem(STORAGE_KEY_PEER_ID, peerId.toJSON());

  return peerId;
}

const ModuleId = {
  WebSockets: WebSockets.prototype[Symbol.toStringTag],
};
