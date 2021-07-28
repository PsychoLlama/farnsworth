import * as connections from '../connections';

jest.mock('libp2p');

describe('Connection effects', () => {
  describe('listen', () => {
    it('returns the peer ID', async () => {
      await expect(connections.listen()).resolves.toEqual({
        id: 'mock-peer-id',
      });
    });
  });
});
