import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.chat.open, (state) => {
    state.chat.open = true;
    state.chat.unreadMessages = false;
  }),

  handleAction(actions.chat.close, (state) => {
    state.chat.open = false;
  }),

  handleAction(actions.chat.toggle, (state) => {
    state.chat.open = !state.chat.open;
    state.chat.unreadMessages = false;
  }),

  handleAction(actions.chat.receiveMessage, (state) => {
    if (!state.chat.open) {
      state.chat.unreadMessages = true;
    }
  }),

  handleAction(actions.call.leave, (state) => {
    state.chat.unreadMessages = false;
  }),
]);
