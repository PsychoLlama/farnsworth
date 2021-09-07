import { createAction } from 'retreon';
import * as effects from '../effects';

export const add = createAction('tracks/add', effects.tracks.add);
