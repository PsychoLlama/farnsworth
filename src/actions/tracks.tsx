import { createAction } from 'retreon';
import * as effects from '../effects';

export const add = createAction('tracks/add', effects.tracks.add);
export const pause = createAction('tracks/pause', effects.tracks.pause);
export const resume = createAction('tracks/resume', effects.tracks.resume);
export const toggle = createAction('tracks/toggle', effects.tracks.toggle);
