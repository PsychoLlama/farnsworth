import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState.phonebook, (handleAction) => [
  handleAction(actions.phonebook.open, (state) => {
    state.open = true;
  }),

  handleAction(actions.phonebook.close, (state) => {
    state.open = false;
  }),

  handleAction(actions.phonebook.toggle, (state) => {
    state.open = !state.open;
  }),
]);
