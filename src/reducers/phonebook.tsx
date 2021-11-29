import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.phonebook.open, (state) => {
    state.phonebook.open = true;
  }),

  handleAction(actions.phonebook.close, (state) => {
    state.phonebook.open = false;
  }),

  handleAction(actions.phonebook.toggle, (state) => {
    state.phonebook.open = !state.phonebook.open;
  }),
]);
