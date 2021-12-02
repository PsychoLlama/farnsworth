import { createReducer } from 'retreon';
import initialState, { State } from './initial-state';
import * as actions from '../actions';
import { MY_PARTICIPANT_ID, TrackSource, TrackKind } from '../utils/constants';

export default createReducer(initialState, (handleAction) => [
  // Some platforms have strict limits on concurrent tracks. For example,
  // mobile won't let you create more than 1 video at a time. This optimistic
  // handler removes the existing track, clearing resources for the new one.
  //
  // It would be neat to support more than one track concurrently on supported
  // platforms for a more graceful stream cutover, but that can be added in
  // the future.
  handleAction.optimistic(
    actions.devices.requestMediaDevices,
    (state, query) => {
      if (query.audio) {
        removeLocalTracksOfKind(TrackKind.Audio, state);
      }

      if (query.video) {
        removeLocalTracksOfKind(TrackKind.Video, state);
      }
    },
  ),

  handleAction(actions.devices.requestMediaDevices, (state, newTracks) => {
    newTracks.forEach((track) => {
      state.participants[MY_PARTICIPANT_ID].trackIds.push(track.trackId);
      state.tracks[track.trackId] = {
        kind: track.kind,
        source: TrackSource.Device,
        enabled: track.enabled,
        local: true,
        groupId: track.groupId,
        deviceId: track.deviceId,
      };
    });
  }),

  handleAction(actions.tracks.add, (state, { track }) => {
    state.tracks[track.id] = {
      kind: track.kind,
      source: track.source,
      enabled: track.enabled,
      local: false,
      groupId: null,
      deviceId: null,
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
        deviceId: track.deviceId,
        groupId: track.groupId,
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
  handleAction(actions.tracks.remove, (state, { trackId, peerId }) => {
    const participant = state.participants[peerId];
    participant.trackIds = participant.trackIds.filter((id) => id !== trackId);

    delete state.tracks[trackId];
  }),
]);

function removeLocalTracksOfKind(kind: TrackKind, state: State) {
  const self = state.participants[MY_PARTICIPANT_ID];
  const myTracks = new Set(self.trackIds);

  // If we just added a video track but we've already got a video track,
  // close out the other one.
  self.trackIds.forEach((trackId) => {
    const track = state.tracks[trackId];
    if (track.kind === kind) {
      delete state.tracks[trackId];
      myTracks.delete(trackId);
    }
  });

  // Update our track list in case we had to remove any.
  self.trackIds = Array.from(myTracks);
}
