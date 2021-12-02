import MediaDevices, { DeviceInfo, DeviceChange } from 'media-devices';
import context from '../conferencing/global-context';
import { TrackKind, TrackSource, MY_PARTICIPANT_ID } from '../utils/constants';
import Logger from '../utils/logger';

const logger = new Logger('devices');

// Put the tracks somewhere useful.
function addTracksToContext(tracks: Array<MediaStreamTrack>) {
  tracks.forEach((track) => {
    context.tracks.set(track.id, track);
  });
}

// Send the new tracks to every open WebRTC connection.
function sendTracksToAllParticipants(
  tracks: Array<MediaStreamTrack>,
  source: TrackSource,
) {
  Array.from(context.connections.values()).forEach((conn) => {
    tracks.forEach((track) => conn.addTrack(track, source));
  });
}

// Turns a track into something you'd trust in Redux.
function getTrackMetadata(track: MediaStreamTrack) {
  const settings = track.getSettings();

  return {
    trackId: track.id,
    kind: track.kind as TrackKind,
    enabled: track.enabled,
    deviceId: settings.deviceId ?? null,
    groupId: settings.groupId ?? null,
  };
}

/**
 * Ask the browser for local mic/camera feeds. The media stream constraints are
 * applied with defaults.
 */
export async function requestMediaDevices(query: MediaStreamConstraints) {
  const constraints: MediaStreamConstraints = {};

  if (query.audio) {
    constraints.audio = query.audio;
  }

  if (query.video) {
    constraints.video = {
      // Prefer videos in 16:9 aspect ratio.
      height: { ideal: 720 },
      width: { ideal: 1280 },
      ...Object(query.video),
    };
  }

  logger.debug('Requesting new tracks:', constraints);
  const stream = await MediaDevices.getUserMedia(constraints);

  const tracks = stream.getTracks();
  tracks.forEach(removeTrackWhenEnded);

  addTracksToContext(tracks);
  sendTracksToAllParticipants(tracks, TrackSource.Device);

  return stream.getTracks().map(getTrackMetadata);
}

// AKA screen sharing.
export async function shareScreen() {
  const stream = await MediaDevices.getDisplayMedia({
    audio: true,
    video: true,
  });

  const tracks = stream.getTracks();
  tracks.forEach(removeTrackWhenEnded);

  addTracksToContext(tracks);
  sendTracksToAllParticipants(tracks, TrackSource.Display);

  return stream.getTracks().map(getTrackMetadata);
}

/**
 * The 'track.onended' event only fires for certain events generally outside
 * your control, like unplugging the camera or pressing the browser's built-in
 * "Stop sharing" button on a screen share.
 *
 * Because of the way RTP transceivers operate, it is impractical to transmit
 * the "ended" event to the remote peer without risking damage to inbound
 * tracks as well. Thus, this event only happens for local tracks.
 *
 * See this article for more details:
 * https://blog.mozilla.org/webrtc/rtcrtptransceiver-explored/
 */
function removeTrackWhenEnded(track: MediaStreamTrack) {
  track.onended = async function removeTrackFromRedux() {
    logger.warn('Track ended unexpectedly:', track.id);

    const { default: sdk } = await import('../utils/sdk');
    sdk.tracks.remove({ trackId: track.id, peerId: MY_PARTICIPANT_ID });
  };
}

export interface DeviceChangeset {
  changes: Array<DeviceChange>;
  devices: Array<DeviceInfo>;
}

/**
 * Observes the device list and yields every changeset as an asynchronous
 * stream. Never exits.
 *
 * Warning: only one instance of this observer can be active at a time.
 * Calling it twice will detach the last and it will never yield again.
 */
export async function* observe() {
  function waitForChange() {
    return new Promise<DeviceChangeset>((resolve) => {
      MediaDevices.ondevicechange = resolve;
    });
  }

  while (true) yield waitForChange();
}
