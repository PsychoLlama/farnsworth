import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';
import { MY_PARTICIPANT_ID, TrackSource } from '../utils/constants';

export default createReducer(initialState, (handleAction) => [
  handleAction(actions.devices.requestMediaDevices, (state, newTracks) => {
    newTracks.forEach((track) => {
      state.participants[MY_PARTICIPANT_ID].trackIds.push(track.trackId);
      state.tracks[track.trackId] = {
        kind: track.kind,
        source: TrackSource.Device,
        enabled: track.enabled,
        local: true,
      };
    });
  }),

  handleAction(actions.tracks.add, (state, { track }) => {
    state.tracks[track.id] = {
      kind: track.kind,
      source: track.source,
      enabled: track.enabled,
      local: false,
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

  handleAction(actions.connections.close, (state, peerId) => {
    state.participants[peerId].trackIds.splice(0).forEach((trackId) => {
      delete state.tracks[trackId];
    });
  }),

  handleAction(actions.call.leave, (state, peerId) => {
    state.participants[peerId].trackIds.forEach((trackId) => {
      delete state.tracks[trackId];
    });

    delete state.participants[peerId];
  }),

  handleAction(actions.devices.shareScreen, (state, tracks) => {
    tracks.forEach((track) => {
      state.participants[MY_PARTICIPANT_ID].trackIds.push(track.trackId);
      state.tracks[track.trackId] = {
        kind: track.kind,
        source: TrackSource.Display,
        enabled: track.enabled,
        local: true,
      };
    });
  }),

  handleAction(actions.devices.stopSharingScreen, (state) => {
    const participant = state.participants[MY_PARTICIPANT_ID];

    // Poor man's _.partition(...).
    const [deviceTracks, displayTracks] = participant.trackIds.reduce(
      ([device, display], trackId) =>
        state.tracks[trackId].source === TrackSource.Display
          ? [device, display.concat(trackId)]
          : [device.concat(trackId), display],
      [[], []],
    );

    displayTracks.forEach((trackId: string) => delete state.tracks[trackId]);
    participant.trackIds = deviceTracks;
  }),

  // We only listen to this event on local tracks.
  handleAction(actions.tracks.markEnded, (state, trackId) => {
    const participant = state.participants[MY_PARTICIPANT_ID];
    participant.trackIds = participant.trackIds.filter((id) => id !== trackId);

    delete state.tracks[trackId];
  }),
]);
