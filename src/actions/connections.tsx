import { createAction } from 'retreon';
import * as effects from '../effects';

export const listen = createAction.async(
  'connections/listen',
  effects.connections.listen,
);

export const dial = createAction.async(
  'connections/dial',
  effects.connections.dial,
);

export const accept = createAction(
  'connections/accept',
  effects.connections.accept,
);
