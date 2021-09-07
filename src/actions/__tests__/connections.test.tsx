import createStore from '../../utils/create-store';
import * as actions from '../connections';
import * as effects from '../../effects';

jest.mock('../../effects/tracks');
jest.mock('../../effects/connections');

describe('Connection actions', () => {
  function setup() {
    return {
      store: createStore(),
    };
  }

  describe('accept()', () => {
    it('sends tracks to the remote stream as a post-dispatch hook', async () => {
      const { store } = setup();

      await store.dispatch(actions.accept('peer-id'));

      expect(effects.tracks.sendLocalTracks).toHaveBeenCalledWith(
        'peer-id',
        store.getState(),
      );
    });
  });

  describe('dial()', () => {
    beforeEach(() => {
      (effects as any).connections.dial.mockReturnValue({ peerId: 'peer-id' });
    });

    it('dials the remote peer', async () => {
      const { store } = setup();

      await store.dispatch(actions.dial('/le-peer'));

      expect(effects.connections.dial).toHaveBeenCalledWith('/le-peer');
    });

    it('sends local media tracks', async () => {
      const { store } = setup();

      await store.dispatch(actions.dial('/le-peer'));

      expect(effects.tracks.sendLocalTracks).toHaveBeenCalledWith(
        'peer-id',
        store.getState(),
      );
    });
  });
});
