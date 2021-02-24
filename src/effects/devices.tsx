import MediaDevices from 'media-devices';
import context from '../conferencing/global-context';
import { TrackKind } from '../utils/constants';

export const requestMediaDevices = async () => {
  const stream = await MediaDevices.getUserMedia({
    audio: true,
    video: true,
  });

  stream.getTracks().forEach((track) => {
    context.tracks.set(track.id, track);
  });

  return stream.getTracks().map((track) => {
    const settings = track.getSettings();

    return {
      trackId: track.id,
      kind: track.kind as TrackKind,
      deviceId: settings.deviceId,
    };
  });
};
