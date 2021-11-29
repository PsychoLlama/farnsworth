import { createReducer } from 'retreon';
import initialState, { ChatMessage } from './initial-state';
import * as actions from '../actions';
import { ConnectionState, MY_PARTICIPANT_ID } from '../utils/constants';

/**
 * Chat messages are sorted by the date stamped by their senders. Of course,
 * this is not reliable as clocks can be wildly out of sync, but it's a good
 * enough measure. A future version might use causal history on message IDs.
 */
function sortMessagesByDate(m1: ChatMessage, m2: ChatMessage) {
  const d1 = new Date(m1.sentDate);
  const d2 = new Date(m2.sentDate);

  return d1.getTime() - d2.getTime();
}

export default createReducer(initialState.participants, (handleAction) => [
  handleAction(actions.devices.requestMediaDevices, (state, tracks) => {
    const trackIds = tracks.map((track) => track.trackId);
    state[MY_PARTICIPANT_ID].trackIds.push(...trackIds);
  }),

  handleAction(actions.connections.dial.actionFactory, (state, { peerId }) => {
    state[peerId] = {
      isMe: false,
      trackIds: [],
      chat: { history: [] },
      connection: {
        state: ConnectionState.Connecting,
      },
    };
  }),

  handleAction(
    actions.connections.accept.actionFactory,
    (state, { peerId }) => {
      // Don't wipe out state on reconnection, just update the connection
      // state.
      if (state[peerId]) {
        state[peerId].connection.state = ConnectionState.Connecting;
        return;
      }

      state[peerId] = {
        isMe: false,
        trackIds: [],
        chat: { history: [] },
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

  handleAction(actions.chat.sendMessage, (state, { remoteId, msg }) => {
    state[remoteId].chat.history.push(msg);
    state[remoteId].chat.history.sort(sortMessagesByDate);
  }),

  handleAction(actions.chat.receiveMessage, (state, msg) => {
    state[msg.author].chat.history.push(msg);
    state[msg.author].chat.history.sort(sortMessagesByDate);
  }),
]);
