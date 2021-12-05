import assert from '../utils/assert';
import { State } from '../reducers/initial-state';
import context from '../conferencing/global-context';
import { TrackKind, TrackSource, EventType } from '../utils/constants';
import { broadcastEvent } from './events';

function getTrackById(id: string) {
  const track = context.tracks.get(id);
  assert(track, `No such track (id="${id}")`);

  return track;
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

export function sendLocalTracks(state: State) {
  Object.entries(state.tracks)
    .filter(([id]) => context.tracks.has(id))
    .filter(([, meta]) => meta.local)
    .forEach(([id, meta]) => {
      const track = getTrackById(id);

      Array.from(context.connections.values()).forEach((conn) => {
        conn.addTrack(track, meta.source);
      });
    });
}
