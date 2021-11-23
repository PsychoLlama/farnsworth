import initNetworkingModule, { loadPeerId } from '../libp2p';
import PeerId from 'peer-id';
import localforage from 'localforage';

jest.mock('libp2p');
jest.mock('peer-id');
jest.mock('localforage');

// These are not good tests. Perhaps they were better never written.
describe('initNetworkingModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes the most basic checks', async () => {
    await initNetworkingModule('/rfc1149');
  });

  describe('loadPeerId', () => {
    it('generates a new peer ID', async () => {
      const peerId = await loadPeerId();

      expect(peerId).toBeInstanceOf(PeerId);
    });

    it('saves the new peer ID', async () => {
      const peerId = await loadPeerId();

      expect(localforage.setItem).toHaveBeenCalledWith(
        expect.anything(),
        peerId.toJSON(),
      );
    });

    it('loads the peer ID from storage, if already set', async () => {
      (localforage as any).getItem.mockResolvedValue({ mock: 'hydrated' });
      await loadPeerId();

      expect(PeerId.createFromJSON).toHaveBeenCalledWith({ mock: 'hydrated' });
    });
  });
});
