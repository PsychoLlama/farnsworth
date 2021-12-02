import { DeviceKind, DeviceInfo } from 'media-devices';
import { createReducer } from 'retreon';
import initialState from './initial-state';
import * as actions from '../actions';

export default createReducer(initialState, (handleAction) => [
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
]);

function createFilter(devices: Array<DeviceInfo>) {
  return function filterByKind(kind: DeviceKind) {
    return devices.filter((device) => device.kind === kind);
  };
}
