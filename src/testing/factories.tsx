import crypto from 'node:crypto';
import { State } from '../reducers/initial-state';
import { TrackKind, TrackSource, ConnectionState } from '../utils/constants';

type Track = State['tracks'][keyof State['tracks']];
type Participant = State['participants'][keyof State['participants']];

export function Track(override?: Partial<Track>): Track {
  return {
    groupId: crypto.randomUUID(),
    deviceId: crypto.randomUUID(),
    enabled: true,
    local: true,
    kind: TrackKind.Video,
    source: TrackSource.Device,
    facingMode: null,
    ...override,
  };
}

export function Participant(override?: Partial<Participant>): Participant {
  return {
    isMe: false,
    trackIds: [],
    connection: { state: ConnectionState.Connected },
    chat: { history: [] },
    ...override,
  };
}
