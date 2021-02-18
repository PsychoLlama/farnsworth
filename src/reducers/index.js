import { createReducer } from 'retreon';
import initialState from './initial-state';

export const hello = createReducer(initialState.hello, () => []);
