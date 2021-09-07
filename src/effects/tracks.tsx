import assert from 'assert';
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
  assert(track, `No such track (invalid redux pointer: '${id}')`);

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
    },
  };
}
