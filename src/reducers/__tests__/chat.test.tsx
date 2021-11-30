import createStore from '../../utils/create-store';
import * as actions from '../../actions';
import { MY_PARTICIPANT_ID } from '../../utils/constants';

describe('Chat reducer', () => {
  describe('open', () => {
    it('opens the chat panel', () => {
      const store = createStore();
      store.dispatch(actions.chat.open());

      expect(store.getState().chat).toMatchObject({
        open: true,
      });
    });

    it('clears the unread notice', () => {
      const store = createStore();
      store.dispatch(
        actions.tools.patch((state) => {
          state.chat.unreadMessages = true;
        }),
      );

      store.dispatch(actions.chat.open());

      expect(store.getState().chat).toHaveProperty('unreadMessages', false);
    });
  });

  describe('close', () => {
    it('closes the chat panel', () => {
      const store = createStore();
      store.dispatch(actions.chat.open());
      store.dispatch(actions.chat.close());

      expect(store.getState().chat).toMatchObject({
        open: false,
      });
    });
  });

  describe('toggle', () => {
    it('toggles the chat panel', () => {
      const store = createStore();
      store.dispatch(actions.chat.toggle());
      expect(store.getState().chat).toMatchObject({ open: true });
      store.dispatch(actions.chat.toggle());
      expect(store.getState().chat).toMatchObject({ open: false });
    });

    // Opening or closing, it doesn't matter. Any change should clear it.
    it('clears the unread notice', () => {
      const store = createStore();
      store.dispatch(
        actions.tools.patch((state) => {
          state.chat.open = false;
          state.chat.unreadMessages = true;
        }),
      );

      store.dispatch(actions.chat.toggle());

      expect(store.getState().chat).toHaveProperty('unreadMessages', false);
    });
  });

  describe('receiveMessage', () => {
    it('sets an unread message notice', () => {
      const store = createStore();

      store.dispatch(
        actions.chat.receiveMessage({
          sentDate: new Date().toISOString(),
          author: MY_PARTICIPANT_ID,
          body: 'hi',
        }),
      );

      expect(store.getState().chat).toHaveProperty('unreadMessages', true);
    });
  });

  describe('call.leave', () => {
    it('clears the unread message notice', () => {
      const store = createStore();
      store.dispatch(
        actions.tools.patch((state) => {
          state.chat.unreadMessages = true;
        }),
      );

      store.dispatch(actions.call.leave(MY_PARTICIPANT_ID));

      expect(store.getState().chat).toHaveProperty('unreadMessages', false);
    });
  });
});
