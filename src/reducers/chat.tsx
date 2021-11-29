import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.chat.open, (state) => {
    state.chat.open = true;
  }),

  handleAction(actions.chat.close, (state) => {
    state.chat.open = false;
  }),

  handleAction(actions.chat.toggle, (state) => {
    state.chat.open = !state.chat.open;
  }),
]);
