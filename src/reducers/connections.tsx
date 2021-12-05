import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';
import { ConnectionState } from '../utils/constants';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.connections.dial, (state, { peerId }) => {
    state.call = { peerId };
    state.participants[peerId] = {
      isMe: false,
      trackIds: [],
      chat: { history: [] },
      connection: {
        state: ConnectionState.Connecting,
      },
    };
  }),

  handleAction(actions.connections.accept, (state, peerId) => {
    state.call = { peerId };

    // Don't wipe out state on reconnection, just update the connection
    // state.
    if (state.participants[peerId]) {
      state.participants[peerId].connection.state = ConnectionState.Connecting;
      return;
    }

    state.participants[peerId] = {
      isMe: false,
      trackIds: [],
      chat: { history: [] },
      connection: {
        state: ConnectionState.Connecting,
      },
    };
  }),

  handleAction(actions.connections.markConnected, (state, peerId) => {
    state.participants[peerId].connection.state = ConnectionState.Connected;
  }),

  handleAction(actions.connections.close, (state, peerId) => {
    state.participants[peerId].connection.state = ConnectionState.Disconnected;
    state.participants[peerId].trackIds.splice(0).forEach((trackId) => {
      delete state.tracks[trackId];
    });
  }),

  handleAction(actions.connections.listen, (state, { id, relayAddr }) => {
    state.relay = { localId: id, server: relayAddr };
  }),
]);
