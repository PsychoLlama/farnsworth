import { createAction } from 'retreon';
import * as effects from '../effects';
import { GET_STATE } from '../utils/middleware/get-state';

export const listen = createAction.async(
  'connections/listen',
  effects.connections.listen,
);

export async function* dial(addr: string) {
  const { peerId } = yield dial.actionFactory(addr);
  effects.tracks.sendLocalTracks(peerId, yield GET_STATE);
}

dial.actionFactory = createAction.async(
  'connections/dial',
  effects.connections.dial,
);

export async function* accept(peerId: string) {
  yield accept.actionFactory.success({ peerId });
  effects.tracks.sendLocalTracks(peerId, yield GET_STATE);
}

accept.actionFactory =
  createAction.factory<{ peerId: string }>('connections/accept');

export const shutdown = createAction(
  'connections/shutdown',
  effects.connections.shutdown,
);
