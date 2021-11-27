import { createAction } from 'retreon';
import { Route } from '../utils/router';

export const change = createAction<Route>('route/change');
