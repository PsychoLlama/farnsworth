import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.connections.dial, (state, { peerId }) => {
    state.call = { peerId };
  }),

  handleAction(actions.connections.accept, (state, peerId) => {
    state.call = { peerId };
  }),

  handleAction(actions.call.leave, (state) => {
    state.call = null;
  }),
]);
