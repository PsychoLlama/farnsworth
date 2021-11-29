import assert from '../utils/assert';
import { State } from '../reducers/initial-state';
import context from '../conferencing/global-context';
import { MY_PARTICIPANT_ID, TrackKind } from '../utils/constants';

export function sendLocalTracks(peerId: string, state: State) {
  const { trackIds } = state.participants[MY_PARTICIPANT_ID];
  const conn = getConnectionById(peerId);

  trackIds.map(getTrackById).forEach((track) => conn.addTrack(track));
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
}: {
  track: MediaStreamTrack;
  peerId: string;
}) {
  context.tracks.set(track.id, track);

  return {
    peerId,
    track: {
      id: track.id,
      kind: track.kind as TrackKind,
      enabled: track.enabled,
    },
  };
}

// Pause and resume events don't make much sense for screen sharing. It seems
// relatively safe (and simple) to send a track kind, in lou of an ID.
function broadcastTrackEvent(event: { type: string; payload: unknown }) {
  Array.from(context.connections.values()).forEach((conn) => {
    conn.messenger.sendEvent(event);
  });
}

export function pause(trackId: string) {
  const track = getTrackById(trackId);
  track.enabled = false;

  broadcastTrackEvent({
    type: 'pause',
    payload: { kind: track.kind },
  });

  return trackId;
}

export function resume(trackId: string) {
  const track = getTrackById(trackId);
  track.enabled = true;
  broadcastTrackEvent({
    type: 'resume',
    payload: { kind: track.kind },
  });

  return trackId;
}

export function toggle(trackId: string) {
  const track = getTrackById(trackId);
  const act = track.enabled ? pause : resume;

  return act(trackId);
}
