import renderer from '../../testing/renderer';
import { InviteLink, mapStateToProps } from '../invite-link';
import createStore from '../../utils/create-store';
import * as actions from '../../actions';

describe('InviteLink', () => {
  const setup = renderer(InviteLink, {
    getDefaultProps: () => ({
      dialAddress: '/bluetooth/5/p2p/hash',
      connected: true,
    }),
  });

  it('renders', () => {
    expect(setup).not.toThrow();
  });

  describe('mapStateToProps', () => {
    it('returns placeholders while connecting to the relay', () => {
      const store = createStore();
      const props = mapStateToProps(store.getState());

      expect(props).toMatchObject({
        dialAddress: '',
        connected: false,
      });
    });

    it('returns the full relay address', async () => {
      const store = createStore();
      await store.dispatch(actions.connections.listen('fake-server'));
      const { relay } = store.getState();
      const props = mapStateToProps(store.getState());

      expect(props).toMatchObject({
        dialAddress: `${relay.server}/p2p-circuit/p2p/${relay.localId}`,
        connected: true,
      });
    });
  });
});
