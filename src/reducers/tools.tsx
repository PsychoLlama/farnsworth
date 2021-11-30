import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.tools.patch, (state, effect) => {
    return effect(state);
  }),
]);
