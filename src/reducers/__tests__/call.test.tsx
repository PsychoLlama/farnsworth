import * as connectionEffects from '../../effects/connections';
import setup from '../../testing/redux';

jest.mock('../../effects/connections');

const mockedConnectionEffects: jest.Mocked<typeof connectionEffects> =
  connectionEffects as any;

describe('Call reducer', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedConnectionEffects.dial.mockResolvedValue({
      peerId: 'mock-peer-id',
    });
  });

  describe('dial', () => {
    it('sets the active peer ID', async () => {
      const { store, sdk } = setup();

      await sdk.connections.dial('peer-id');

      expect(store.getState().call).toEqual({
        peerId: 'mock-peer-id',
      });
    });
  });

  describe('accept', () => {
    it('sets the active peer ID', async () => {
      const { store, sdk } = setup();

      sdk.connections.accept('mock-peer-id');

      expect(store.getState().call).toEqual({
        peerId: 'mock-peer-id',
      });
    });
  });

  describe('leave', () => {
    it('leaves the call', async () => {
      const { store, sdk } = setup();

      sdk.connections.accept('mock-peer-id');
      sdk.call.leave('mock-peer-id');

      expect(store.getState().call).toBeNull();
    });
  });
});
