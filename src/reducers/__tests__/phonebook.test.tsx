import createStore from '../../utils/create-store';
import * as actions from '../../actions';

describe('Participants reducer', () => {
  function setup() {
    const store = createStore();

    return {
      store,
    };
  }

  describe('open()', () => {
    it('opens the phonebook', async () => {
      const { store } = setup();

      await store.dispatch(actions.phonebook.open());
      const { phonebook } = store.getState();

      expect(phonebook).toHaveProperty('open', true);
    });
  });

  describe('close()', () => {
    it('closes the phonebook', async () => {
      const { store } = setup();

      await store.dispatch(actions.phonebook.open());
      await store.dispatch(actions.phonebook.close());
      const { phonebook } = store.getState();

      expect(phonebook).toHaveProperty('open', false);
    });
  });

  describe('toggle()', () => {
    it('opens and closes the phonebook', async () => {
      const { store } = setup();

      await store.dispatch(actions.phonebook.toggle());
      expect(store.getState().phonebook).toHaveProperty('open', true);

      await store.dispatch(actions.phonebook.toggle());
      expect(store.getState().phonebook).toHaveProperty('open', false);
    });
  });
});
