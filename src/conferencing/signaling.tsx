import P2P from 'libp2p';
import { NOISE } from 'libp2p-noise';
import MPLEX from 'libp2p-mplex';
import Websockets from 'libp2p-websockets';
import * as filters from 'libp2p-websockets/src/filters';

const SERVER_ADDRESS = process.env.RELAY_SERVER_ADDRESS;

/**
 * Signaling works in two parts: First, we connect to the relay server and
 * tell them who we're looking for. Second, the relay server tells us when
 * that peer joins and we establish a relayed connection to them.
 */
async function initNetworkingModule() {
  const p2p = await P2P.create({
    addresses: {
      listen: [`${SERVER_ADDRESS}/p2p-circuit`],
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

  return p2p;
}

export async function init() {
  const p2p = await initNetworkingModule();
  await p2p.start();
}

const ModuleId = {
  Websockets: Websockets.prototype[Symbol.toStringTag],
};
