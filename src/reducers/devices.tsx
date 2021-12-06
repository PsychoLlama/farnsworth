import { DeviceKind, DeviceInfo } from 'media-devices';
import { createReducer } from 'retreon';
import initialState, { State } from './initial-state';
import * as actions from '../actions';
import { MY_PARTICIPANT_ID, TrackSource, TrackKind } from '../utils/constants';
import { GumError } from '../effects/devices';

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

  handleAction.error(actions.devices.requestMediaDevices, (state, error) => {
    if (error instanceof GumError) {
      state.sources.error = error.type;
    }
  }),

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
        facingMode: track.facingMode,
      };
    });
  }),

  handleAction(actions.devices.list, (state, devices) => {
    const kind = createFilter(devices);
    state.sources.available.audio = kind(DeviceKind.AudioInput);
    state.sources.available.video = kind(DeviceKind.VideoInput);
  }),

  handleAction(
    actions.devices.observe.actionFactory,
    (state, { devices, changes }) => {
      const kind = createFilter(devices);
      state.sources.available.audio = kind(DeviceKind.AudioInput);
      state.sources.available.video = kind(DeviceKind.VideoInput);
      state.sources.changes = changes;
    },
  ),

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
        facingMode: null,
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
]);

function createFilter(devices: Array<DeviceInfo>) {
  return function filterByKind(kind: DeviceKind) {
    const deviceIds = new Set();

    // I've only seen this happen once, and it was on my laptop, which is
    // admittedly a bespoke frankenstein of obscure linux tweaks, and it truly
    // was a duplicate device. It should never happen in practice.
    function removeDuplicates(device: DeviceInfo) {
      const duplicate = deviceIds.has(device.deviceId);
      deviceIds.add(device.deviceId);

      return !duplicate;
    }

    return devices
      .filter((device) => device.kind === kind)
      .filter(removeDuplicates);
  };
}

function removeLocalTracksOfKind(kind: TrackKind, state: State) {
  const self = state.participants[MY_PARTICIPANT_ID];
  const myTracks = new Set(self.trackIds);

  // If we just added a video track but we've already got a video track,
  // close out the other one.
  self.trackIds.forEach((trackId) => {
    const track = state.tracks[trackId];
    if (track.kind === kind && track.source === TrackSource.Device) {
      delete state.tracks[trackId];
      myTracks.delete(trackId);
    }
  });

  // Update our track list in case we had to remove any.
  self.trackIds = Array.from(myTracks);
}
