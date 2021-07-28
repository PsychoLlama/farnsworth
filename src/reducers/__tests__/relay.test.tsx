import createStore from '../../utils/create-store';
import * as actions from '../../actions';

describe('Relay reducer', () => {
  function setup() {
    const store = createStore();

    return {
      store,
    };
  }

  const FAKE_RELAY_ADDR = '/ip4/127.0.0.1/tcp/4444/ws/p2p/le-hash';

  it('sets the local ID after connecting to the server', async () => {
    const { store } = setup();

    expect(store.getState().relay).toBeNull();
    await store.dispatch(actions.connections.listen(FAKE_RELAY_ADDR));
    expect(store.getState().relay).toEqual({
      localId: 'mock-peer-id',
      server: FAKE_RELAY_ADDR,
    });
  });
});
