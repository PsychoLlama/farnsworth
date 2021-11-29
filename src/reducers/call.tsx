import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.connections.dial.actionFactory, (state, { peerId }) => {
    state.call = { peerId };
  }),

  handleAction(
    actions.connections.accept.actionFactory,
    (state, { peerId }) => {
      state.call = { peerId };
    },
  ),

  handleAction(actions.call.leave, (state) => {
    state.call = null;
  }),
]);
