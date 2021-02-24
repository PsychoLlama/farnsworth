import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState.tracks, (handleAction) => [
  handleAction(actions.devices.requestMediaDevices, (state, newTracks) => {
    newTracks.forEach((track) => {
      state[track.trackId] = {
        kind: track.kind,
      };
    });
  }),
]);
