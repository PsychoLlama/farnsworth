import { createReducer } from 'retreon';
import initialState, { PanelView, ChatMessage } from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.chat.receiveMessage, (state, msg) => {
    state.participants[msg.author].chat.history.push(msg);
    state.participants[msg.author].chat.history.sort(sortMessagesByDate);

    if (state.panel.view !== PanelView.Chat) {
      state.chat.unreadMessages = true;
    }
  }),

  handleAction(actions.chat.sendMessage, (state, { remoteId, msg }) => {
    state.participants[remoteId].chat.history.push(msg);
    state.participants[remoteId].chat.history.sort(sortMessagesByDate);
  }),
]);

/**
 * Chat messages are sorted by the date stamped by their senders. Of course,
 * this is not reliable as clocks can be wildly out of sync, but it's a good
 * enough measure. A future version might use causal history on message IDs.
 */
function sortMessagesByDate(m1: ChatMessage, m2: ChatMessage) {
  const d1 = new Date(m1.sentDate);
  const d2 = new Date(m2.sentDate);

  return d1.getTime() - d2.getTime();
}
