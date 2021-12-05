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

export const accept = createAction<string>('connections/accept');

export const close = createAction(
  'connections/close',
  effects.connections.close,
);

export const markConnected = createAction<string>('connections/mark-connected');
