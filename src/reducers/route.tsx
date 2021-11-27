import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState.route, (handleAction) => [
  handleAction(actions.route.change, (_, route) => route),
]);
