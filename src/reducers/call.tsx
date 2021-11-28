import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState.call, (handleAction) => [
  handleAction(actions.connections.dial.actionFactory, (_, { peerId }) => {
    return { peerId };
  }),

  handleAction(actions.connections.accept.actionFactory, (_, { peerId }) => {
    return { peerId };
  }),
]);
