import MediaDevices from 'media-devices';
import context from '../conferencing/global-context';
import { TrackKind } from '../utils/constants';

export const requestMediaDevices = async () => {
  const stream = await MediaDevices.getUserMedia({
    audio: true,

    // Prefer videos in 16:9 aspect ratio.
    video: {
      height: { ideal: 720 },
      width: { ideal: 1280 },
    },
  });

  stream.getTracks().forEach((track) => {
    context.tracks.set(track.id, track);
  });

  // Send the new tracks to every open connection.
  Array.from(context.connections.values()).forEach((conn) => {
    stream.getTracks().forEach((track) => conn.addTrack(track));
  });

  return stream.getTracks().map((track) => {
    const settings = track.getSettings();

    return {
      trackId: track.id,
      kind: track.kind as TrackKind,
      deviceId: settings.deviceId,
      enabled: track.enabled,
    };
  });
};
