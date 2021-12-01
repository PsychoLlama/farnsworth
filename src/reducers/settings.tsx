import { createReducer } from 'retreon';
import initialState, { PanelView } from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.settings.open, (state) => {
    state.panel.view = PanelView.Settings;
  }),

  handleAction(actions.settings.close, (state) => {
    state.panel.view = PanelView.None;
  }),

  handleAction(actions.settings.toggle, (state) => {
    if (state.panel.view !== PanelView.Settings) {
      state.panel.view = PanelView.Settings;
    } else {
      state.panel.view = PanelView.None;
    }
  }),
]);
