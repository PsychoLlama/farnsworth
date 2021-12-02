import { createAction } from 'retreon';
import * as effects from '../effects';

export const load = createAction.async('settings/load', effects.settings.load);
export const update = createAction.async(
  'settings/update',
  effects.settings.update,
);
