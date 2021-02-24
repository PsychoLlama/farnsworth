import MediaDevices from 'media-devices';

export const requestMediaDevices = async () => {
  const stream = await MediaDevices.getUserMedia({
    audio: true,
    video: true,
  });

  const [audioTrack] = stream.getAudioTracks();
  const [videoTrack] = stream.getVideoTracks();

  return {
    tracks: [audioTrack.id, videoTrack.id],
  };
};
