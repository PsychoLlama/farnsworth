import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.settings.load, (state, settings) => {
    state.settings.webrtc = settings;
  }),

  handleAction(actions.settings.reset, (state) => {
    state.settings.webrtc = initialState.settings.webrtc;
  }),

  handleAction.optimistic(actions.settings.update, (state, overrides) => {
    Object.assign(state.settings.webrtc, overrides);
  }),
]);
