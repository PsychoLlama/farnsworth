import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.connections.listen, (state, { id, relayAddr }) => {
    state.relay = { localId: id, server: relayAddr };
  }),
]);
