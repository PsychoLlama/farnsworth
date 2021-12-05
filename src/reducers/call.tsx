import { createReducer } from 'retreon';
import initialState, { PanelView } from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.call.leave, (state, peerId) => {
    state.participants[peerId].trackIds.forEach((trackId) => {
      delete state.tracks[trackId];
    });

    delete state.participants[peerId];

    state.call = null;
    state.chat.unreadMessages = false;
    if (state.panel.view === PanelView.Chat) {
      state.panel.view = PanelView.None;
    }
  }),
]);
