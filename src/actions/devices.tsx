import { createAction } from 'retreon';
import * as effects from '../effects';

export const requestMediaDevices = createAction.async(
  'devices/request-media-devices',
  effects.devices.requestMediaDevices,
);
