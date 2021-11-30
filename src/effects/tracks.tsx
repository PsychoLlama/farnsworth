import assert from '../utils/assert';
import { State } from '../reducers/initial-state';
import context from '../conferencing/global-context';
import {
  MY_PARTICIPANT_ID,
  TrackKind,
  TrackSource,
  EventType,
} from '../utils/constants';
import { broadcastEvent } from './events';

export function sendLocalTracks(peerId: string, state: State) {
  const { trackIds } = state.participants[MY_PARTICIPANT_ID];
  const conn = getConnectionById(peerId);

  trackIds.forEach((trackId) => {
    const track = getTrackById(trackId);
    const { source } = state.tracks[trackId];
    conn.addTrack(track, source);
  });
}

function getTrackById(id: string) {
  const track = context.tracks.get(id);
  assert(track, `No such track (id="${id}")`);

  return track;
}

function getConnectionById(peerId: string) {
  const conn = context.connections.get(peerId);
  assert(conn, `No such connection '${peerId}'`);

  return conn;
}

// Adds a new track to the global context. Used to hold onto remote tracks.
export function add({
  track,
  peerId,
  source,
}: {
  track: MediaStreamTrack;
  peerId: string;
  source: TrackSource;
}) {
  context.tracks.set(track.id, track);

  return {
    peerId,
    track: {
      id: track.id,
      kind: track.kind as TrackKind,
      enabled: track.enabled,
      source,
    },
  };
}

export function pause(trackId: string) {
  const track = getTrackById(trackId);
  track.enabled = false;

  broadcastEvent({
    type: EventType.Pause,
    payload: { kind: track.kind },
  });

  return trackId;
}

export function resume(trackId: string) {
  const track = getTrackById(trackId);
  track.enabled = true;

  broadcastEvent({
    type: EventType.Resume,
    payload: { kind: track.kind },
  });

  return trackId;
}

export function toggle(trackId: string) {
  const track = getTrackById(trackId);
  const act = track.enabled ? pause : resume;

  return act(trackId);
}
