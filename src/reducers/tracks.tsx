import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState.tracks, (handleAction) => [
  handleAction(actions.devices.requestMediaDevices, (state, newTracks) => {
    newTracks.forEach((track) => {
      state[track.trackId] = {
        kind: track.kind,
        enabled: track.enabled,
      };
    });
  }),

  handleAction(actions.tracks.add, (state, { track }) => {
    state[track.id] = { kind: track.kind, enabled: track.enabled };
  }),

  handleAction(actions.tracks.pause, (state, trackId) => {
    state[trackId].enabled = false;
  }),

  handleAction(actions.tracks.resume, (state, trackId) => {
    state[trackId].enabled = true;
  }),

  handleAction(actions.tracks.toggle, (state, trackId) => {
    state[trackId].enabled = !state[trackId].enabled;
  }),
]);
