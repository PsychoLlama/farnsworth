import createStore from '../../utils/create-store';
import * as actions from '../../actions';
import * as effects from '../../effects';

jest.mock('../../effects');

describe('Call reducer', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (effects.connections.dial as any).mockResolvedValue({
      peerId: 'mock-peer-id',
    });
  });

  describe('dial', () => {
    it('sets the active peer ID', async () => {
      const store = createStore();
      await store.dispatch(actions.connections.dial('peer-id'));

      expect(store.getState().call).toEqual({
        peerId: 'mock-peer-id',
      });
    });
  });

  describe('accept', () => {
    it('sets the active peer ID', async () => {
      const store = createStore();
      await store.dispatch(actions.connections.accept('mock-peer-id'));

      expect(store.getState().call).toEqual({
        peerId: 'mock-peer-id',
      });
    });
  });

  describe('leave', () => {
    it('leaves the call', async () => {
      const store = createStore();
      await store.dispatch(actions.connections.accept('mock-peer-id'));
      store.dispatch(actions.call.leave('mock-peer-id'));

      expect(store.getState().call).toBeNull();
    });
  });
});
