import MediaDevices from 'media-devices';
import { createAction } from 'retreon';
import * as effects from '../effects';

export const requestMediaDevices = createAction.async(
  'devices/request-media-devices',
  effects.devices.requestMediaDevices,
);

export const shareScreen = createAction.async(
  'devices/share-screen',
  effects.devices.shareScreen,
);

// Deleting the tracks from redux is enough to trigger garbage collection and
// carry the 'ended' event through the system.
export const stopSharingScreen = createAction('devices/stop-sharing-screen');

export const list = createAction.async(
  'devices/list',
  MediaDevices.enumerateDevices,
);

export async function* observe() {
  for await (const changeset of effects.devices.observe()) {
    yield observe.actionFactory.success(changeset);
  }
}

observe.actionFactory =
  createAction.factory<effects.devices.DeviceChangeset>('devices/observe');
