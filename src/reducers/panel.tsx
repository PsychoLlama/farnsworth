import { createReducer } from 'retreon';
import * as actions from '../actions';
import initialState, { State, PanelView } from './initial-state';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.panel.open, openLastReasonableView),

  handleAction(actions.panel.close, (state) => {
    state.panel.view = PanelView.None;
  }),

  handleAction(actions.panel.toggle, (state) => {
    if (state.panel.view === PanelView.None) {
      openLastReasonableView(state);
    } else {
      state.panel.view = PanelView.None;
    }
  }),

  handleAction(actions.panel.showChat, (state) => {
    state.panel.lastView = PanelView.Chat;
    state.panel.view = PanelView.Chat;
    state.chat.unreadMessages = false;
  }),

  handleAction(actions.panel.showSettings, (state) => {
    state.panel.lastView = PanelView.Settings;
    state.panel.view = PanelView.Settings;
  }),

  handleAction(actions.call.leave, (state) => {
    if (state.panel.view === PanelView.Chat) {
      state.panel.view = PanelView.None;
    }
  }),
]);

// If you're not in a call, there aren't any chat messages to look at. Open
// the most reasonable view possible, which in that case means settings.
function openLastReasonableView(state: State) {
  if (state.call === null) {
    state.panel.view = PanelView.Settings;
  } else {
    state.panel.view = state.panel.lastView;
  }

  if (state.panel.view === PanelView.Chat) {
    state.chat.unreadMessages = false;
  }
}
