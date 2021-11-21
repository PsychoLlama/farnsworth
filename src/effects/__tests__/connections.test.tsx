import * as connections from '../connections';
import context from '../../conferencing/global-context';
import { Stream } from '../../testing/mocks/libp2p';
import sdk from '../../utils/sdk';

jest.mock('libp2p');
jest.mock('../../utils/sdk');

describe('Connection effects', () => {
  beforeEach(() => {
    context.p2p = null;
    context.connections.clear();
  });

  describe('listen', () => {
    it('returns the peer ID', async () => {
      await expect(connections.listen('/rfc1149')).resolves.toEqual({
        id: 'mock-peer-id',
        relayAddr: '/rfc1149',
      });
    });

    it('adds inbound connections to the connections context', async () => {
      await connections.listen('/music');
      await (context as any).p2p.mock.simulateRequest(
        connections.SIGNALING_PROTOCOL,
        {
          stream: Stream.from([]),
          connection: {
            remotePeer: { toB58String: () => 'remote-id' },
          },
        },
      );

      expect(context.connections.size).toBe(1);
      expect(sdk.connections.accept).toHaveBeenCalledWith('remote-id');
    });
  });

  describe('dial', () => {
    it('dials the remote peer', async () => {
      await connections.listen('/server');
      await connections.dial('/ip4/0.0.0.0/');

      expect(context.p2p.dialProtocol).toHaveBeenCalledWith(
        '/ip4/0.0.0.0/',
        connections.SIGNALING_PROTOCOL,
      );
    });

    it('puts the connection manager in global context', async () => {
      await connections.listen('/PRISM');
      await connections.dial('/ip4/0.0.0.0/');

      expect(context.connections.size).toBe(1);
    });

    it('returns the remote ID', async () => {
      await connections.listen('/here');

      const peerId = `Qm${Array(44).fill('Y').join('')}`;
      const result = await connections.dial(
        `/ip4/127.0.0.1/tcp/1337/p2p/${peerId}`,
      );

      expect(result).toEqual({ peerId });
    });
  });
});
