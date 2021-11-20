import renderer from '../../testing/renderer';
import { Phonebook, mapStateToProps } from '../phonebook';
import createStore from '../../utils/create-store';
import * as actions from '../../actions';

describe('Phonebook', () => {
  const setup = renderer(Phonebook, {
    getDefaultProps: () => ({
      // Imperative action creator - not worth adding correct types here.
      dial: jest.fn() as any,
      relayServer: '/bluetooth/5/p2p/hash',
    }),
  });

  it('keeps track of the invite input state', () => {
    const { findByTestId } = setup();
    const value = '/invite/code';

    findByTestId('invite-code-input').simulate('change', value);
    expect(findByTestId('invite-code-input').prop('value')).toBe(value);

    findByTestId('invite-code-form').simulate('submit', new Event('submit'));

    // Input should be cleared.
    expect(findByTestId('invite-code-input').prop('value')).toBe('');
  });

  it('dials the remote peer', () => {
    const { findByTestId, props } = setup();

    findByTestId('invite-code-input').simulate('change', 'peer-id');
    findByTestId('invite-code-form').simulate('submit', new Event('submit'));

    expect(props.dial).toHaveBeenCalledWith(
      `${props.relayServer}/p2p-circuit/p2p/peer-id`,
    );
  });

  describe('mapStateToProps', () => {
    it('grabs necessary state from redux', async () => {
      const store = createStore();
      await store.dispatch(actions.connections.listen('fake-server'));
      const state = store.getState();

      expect(mapStateToProps(state)).toMatchInlineSnapshot(`
        Object {
          "relayServer": "fake-server",
        }
      `);
    });
  });
});
