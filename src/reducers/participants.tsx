import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';
import { ConnectionState, MY_PARTICIPANT_ID } from '../utils/constants';

export default createReducer(initialState.participants, (handleAction) => [
  handleAction(actions.devices.requestMediaDevices, (state, tracks) => {
    const trackIds = tracks.map((track) => track.trackId);
    state[MY_PARTICIPANT_ID].trackIds.push(...trackIds);
  }),

  handleAction(actions.connections.dial.actionFactory, (state, { peerId }) => {
    state[peerId] = {
      isMe: false,
      trackIds: [],
      connection: {
        state: ConnectionState.Connecting,
      },
    };
  }),

  handleAction(
    actions.connections.accept.actionFactory,
    (state, { peerId }) => {
      state[peerId] = {
        isMe: false,
        trackIds: [],
        connection: {
          state: ConnectionState.Connecting,
        },
      };
    },
  ),

  handleAction(actions.tracks.add, (state, { peerId, track }) => {
    state[peerId].trackIds.push(track.id);
  }),

  handleAction(actions.connections.markConnected, (state, peerId) => {
    state[peerId].connection.state = ConnectionState.Connected;
  }),

  handleAction(actions.connections.markDisconnected, (state, peerId) => {
    state[peerId].connection.state = ConnectionState.Disconnected;
    state[peerId].trackIds = [];
  }),
]);
