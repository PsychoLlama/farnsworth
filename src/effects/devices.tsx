import MediaDevices from 'media-devices';
import context from '../conferencing/global-context';
import { TrackKind } from '../utils/constants';

// Put the tracks somewhere useful.
function addTracksToContext(stream: MediaStream) {
  stream.getTracks().forEach((track) => {
    context.tracks.set(track.id, track);
  });
}

// Send the new tracks to every open WebRTC connection.
function sendTracksToAllParticipants(stream: MediaStream) {
  Array.from(context.connections.values()).forEach((conn) => {
    stream.getTracks().forEach((track) => conn.addTrack(track));
  });
}

// Turns a track into something you'd trust in Redux.
function getTrackMetadata(track: MediaStreamTrack) {
  const settings = track.getSettings();

  return {
    trackId: track.id,
    kind: track.kind as TrackKind,
    deviceId: settings.deviceId,
    enabled: track.enabled,
  };
}

export async function requestMediaDevices() {
  const stream = await MediaDevices.getUserMedia({
    audio: true,

    // Prefer videos in 16:9 aspect ratio.
    video: {
      height: { ideal: 720 },
      width: { ideal: 1280 },
    },
  });

  addTracksToContext(stream);
  sendTracksToAllParticipants(stream);

  return stream.getTracks().map(getTrackMetadata);
}

// AKA screen sharing.
export async function shareScreen() {
  const stream = await MediaDevices.getDisplayMedia({
    audio: true,
    video: true,
  });

  addTracksToContext(stream);
  sendTracksToAllParticipants(stream);

  return stream.getTracks().map(getTrackMetadata);
}
