#!/usr/bin/env node
import PeerId from 'peer-id';
import fs from 'fs/promises';

const CONFIG_FILE = new URL('../server/config.json', import.meta.url);

// The peer ID can't be regenerated. Proceed carefully.
if ((await pathExists(CONFIG_FILE)) === false) {
  console.log('Generating server identity...');

  await writeJson({
    peerId: await PeerId.create(),
    server: {
      port: 30000,
      host: '0.0.0.0',
    },
  });

  console.log('Done =>', CONFIG_FILE.pathname);
}

async function writeJson(data) {
  const fileContents = JSON.stringify(data, null, 2) + '\n';
  await fs.writeFile(CONFIG_FILE, fileContents);
}

async function pathExists(path) {
  return fs.stat(path).then(
    () => true,
    () => false,
  );
}
