import { createAction } from 'retreon';
import * as effects from '../effects';

export const listen = createAction.async(
  'connections/listen',
  effects.connections.listen,
);
