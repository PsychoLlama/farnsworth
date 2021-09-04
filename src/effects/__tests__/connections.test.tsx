import * as connections from '../connections';

jest.mock('libp2p');

describe('Connection effects', () => {
  describe('listen', () => {
    it('returns the peer ID', async () => {
      await expect(connections.listen('/rfc1149')).resolves.toEqual({
        id: 'mock-peer-id',
        relayAddr: '/rfc1149',
      });
    });
  });
});
