import crypto from 'node:crypto';
import { State } from '../reducers/initial-state';
import { TrackKind, TrackSource } from '../utils/constants';

type Track = State['tracks'][keyof State['tracks']];

export function Track(override: Partial<Track>): Track {
  return {
    groupId: crypto.randomUUID(),
    deviceId: crypto.randomUUID(),
    enabled: true,
    local: true,
    kind: TrackKind.Video,
    source: TrackSource.Device,
    ...override,
  };
}
