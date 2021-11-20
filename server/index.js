import fs from 'fs/promises';
import https from 'https';
import P2P from 'libp2p';
import { NOISE } from 'libp2p-noise';
import MPLEX from 'libp2p-mplex';
import WebSockets from 'libp2p-websockets';
import PeerId from 'peer-id';
import createLogger from 'debug';

const debug = createLogger('farnsworth');

await main();

/**
 * This server acts as an encrypted, trustless relay. All the heavy lifting is
 * done by libp2p.
 *
 * @see https://libp2p.io/
 */

async function main() {
  const p2p = await initNetworkingModule();
  await p2p.start();

  if (p2p.multiaddrs.length) {
    debug('Active interfaces:');
    debug(p2p.multiaddrs.map((addr) => `${addr}/p2p/${p2p.peerId}`).join('\n'));
  } else {
    debug('No listening interfaces defined.');
  }

  p2p.connectionManager.on('peer:connect', ({ remoteAddr, remotePeer }) => {
    debug('New connection:', remoteAddr);
    debug(`-> ${remotePeer.toB58String()}`);
  });

  async function stop() {
    debug('Terminating...');
    await p2p.stop();
    process.exit(0);
  }

  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}

async function initNetworkingModule() {
  const config = await loadConfig();

  const p2p = await P2P.create({
    peerId: await PeerId.createFromJSON(config.peerId),
    addresses: {
      listen: [`/ip4/${config.server.host}/tcp/${config.server.port}/wss`],
    },
    modules: {
      transport: [WebSockets],
      connEncryption: [NOISE],
      streamMuxer: [MPLEX],
    },
    config: {
      relay: {
        enabled: true,
        hop: { enabled: true, active: true },
        advertise: { enabled: false },
      },
      transport: {
        WebSockets: {
          listenerOptions: {
            server: await createWebServer(),
          },
        },
      },
    },
  });

  return p2p;
}

async function createWebServer() {
  const [cert, key] = await Promise.all([
    readRelativePath('./certs/bootstrap.crt'),
    readRelativePath('./certs/bootstrap.key'),
  ]).catch(() => {
    // This isn't hard, but it hasn't been automated. Here's what you need:
    // - Change this code to `http.Server()`
    // - Update `RELAY_SERVER_ADDRESS` in your .env file (remove /wss)
    // - If you're connecting over the internet, you'll need a transparent
    //   proxy over localhost to bypass mixed content restrictions on secured
    //   domains.
    console.error(`Missing TLS certificates. This workflow isn't ready yet.`);
    process.exit(1);
  });

  return https.createServer({ cert, key });
}

async function readRelativePath(relativePath) {
  const url = new URL(relativePath, import.meta.url);
  return await fs.readFile(url);
}

async function loadConfig() {
  // TODO: Port over `./bin/setup` from the signaling repo.
  const fileContents = await readRelativePath('./config.json').catch(() => {
    console.error('Missing config file. Did you run `./bin/setup`?');
    process.exit(1);
  });

  return JSON.parse(fileContents);
}
