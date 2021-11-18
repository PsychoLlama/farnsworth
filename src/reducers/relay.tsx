import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState.relay, (handleAction) => [
  handleAction(actions.connections.listen, (state, { id, relayAddr }) => ({
    localId: id,
    server: relayAddr,
  })),
]);