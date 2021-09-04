import * as connections from '../connections';
import context from '../../conferencing/global-context';

jest.mock('libp2p');

describe('Connection effects', () => {
  beforeEach(() => {
    context.p2p = null;
  });

  describe('listen', () => {
    it('returns the peer ID', async () => {
      await expect(connections.listen('/rfc1149')).resolves.toEqual({
        id: 'mock-peer-id',
        relayAddr: '/rfc1149',
      });
    });
  });

  describe('dial', () => {
    it('dials the remote peer', async () => {
      await connections.listen('/server');
      await connections.dial('/remote/peer');

      expect(context.p2p.dialProtocol).toHaveBeenCalledWith(
        '/remote/peer',
        connections.SIGNALING_PROTOCOL,
      );
    });
  });
});
