import { createAction } from 'retreon';
import * as effects from '../effects';
import { TrackKind } from '../utils/constants';

export const add = createAction('tracks/add', effects.tracks.add);
export const pause = createAction('tracks/pause', effects.tracks.pause);
export const resume = createAction('tracks/resume', effects.tracks.resume);
export const toggle = createAction('tracks/toggle', effects.tracks.toggle);
export const markPaused = createAction<TrackKind>('tracks/mark-paused');
export const markResumed = createAction<TrackKind>('tracks/mark-resumed');
export const markEnded = createAction<string>('tracks/mark-ended');
