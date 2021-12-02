import createStore from '../../utils/create-store';
import * as actions from '../../actions';
import { MY_PARTICIPANT_ID } from '../../utils/constants';
import { PanelView } from '../initial-state';

describe('Chat reducer', () => {
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
    it('closes the chat panel and clears the unread notice', () => {
      const store = createStore();
      store.dispatch(
        actions.tools.patch((state) => {
          state.chat.unreadMessages = true;
        }),
      );

      store.dispatch(actions.call.leave(MY_PARTICIPANT_ID));

      expect(store.getState().chat).toHaveProperty('unreadMessages', false);
      expect(store.getState().panel).toMatchObject({
        view: PanelView.None,
      });
    });
  });
});
