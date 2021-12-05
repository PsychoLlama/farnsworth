import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.tracks.add, (state, { track, peerId }) => {
    state.participants[peerId].trackIds.push(track.id);
    state.tracks[track.id] = {
      kind: track.kind,
      source: track.source,
      enabled: track.enabled,
      local: false,
      groupId: null,
      deviceId: null,
      facingMode: null,
    };
  }),

  handleAction(actions.tracks.pause, (state, trackId) => {
    state.tracks[trackId].enabled = false;
  }),

  handleAction(actions.tracks.resume, (state, trackId) => {
    state.tracks[trackId].enabled = true;
  }),

  handleAction(actions.tracks.toggle, (state, trackId) => {
    state.tracks[trackId].enabled = !state.tracks[trackId].enabled;
  }),

  handleAction(actions.tracks.markPaused, (state, kind) => {
    for (const track of Object.values(state.tracks)) {
      if (track.kind === kind && !track.local) {
        track.enabled = false;
      }
    }
  }),

  handleAction(actions.tracks.markResumed, (state, kind) => {
    for (const track of Object.values(state.tracks)) {
      if (track.kind === kind && !track.local) {
        track.enabled = true;
      }
    }
  }),

  // We only listen to this event on local tracks.
  handleAction(actions.tracks.remove, (state, { trackId, peerId }) => {
    const participant = state.participants[peerId];
    participant.trackIds = participant.trackIds.filter((id) => id !== trackId);

    delete state.tracks[trackId];
  }),
]);
