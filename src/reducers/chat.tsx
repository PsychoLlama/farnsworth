import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState.chat, (handleAction) => [
  handleAction(actions.chat.open, (state) => {
    state.open = true;
  }),

  handleAction(actions.chat.close, (state) => {
    state.open = false;
  }),

  handleAction(actions.chat.toggle, (state) => {
    state.open = !state.open;
  }),
]);
