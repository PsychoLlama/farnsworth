import createStore from '../../utils/create-store';
import * as actions from '../../actions';

describe('Chat reducer', () => {
  describe('open', () => {
    it('opens the chat panel', () => {
      const store = createStore();
      store.dispatch(actions.chat.open());

      expect(store.getState().chat).toEqual({
        open: true,
      });
    });
  });

  describe('close', () => {
    it('closes the chat panel', () => {
      const store = createStore();
      store.dispatch(actions.chat.open());
      store.dispatch(actions.chat.close());

      expect(store.getState().chat).toEqual({
        open: false,
      });
    });
  });

  describe('toggle', () => {
    it('toggles the chat panel', () => {
      const store = createStore();
      store.dispatch(actions.chat.toggle());
      expect(store.getState().chat).toEqual({ open: true });
      store.dispatch(actions.chat.toggle());
      expect(store.getState().chat).toEqual({ open: false });
    });
  });
});
