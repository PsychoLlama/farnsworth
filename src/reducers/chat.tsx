import { createReducer } from 'retreon';
import initialState, { PanelView } from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.chat.receiveMessage, (state) => {
    if (state.panel.view !== PanelView.Chat) {
      state.chat.unreadMessages = true;
    }
  }),

  handleAction(actions.call.leave, (state) => {
    state.chat.unreadMessages = false;
    state.panel.view = PanelView.None;
  }),
]);
