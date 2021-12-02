import MediaDevices from 'media-devices';
import * as effects from '../';
import { TrackKind, MY_PARTICIPANT_ID } from '../../utils/constants';
import context from '../../conferencing/global-context';
import ConnectionManager from '../../conferencing/webrtc';
import sdk from '../../utils/sdk';

jest.mock('media-devices');
jest.mock('../../conferencing/webrtc');
jest.mock('../../utils/sdk');

const MockMediaDevices: jest.Mocked<typeof MediaDevices> = MediaDevices as any;

describe('Device effects', () => {
  function createMediaStream(overrides: Array<Partial<MediaStreamTrack>> = []) {
    const stream = new MediaStream();
    const tracks = overrides.map((overrides) => {
      const track = new MediaStreamTrack();
      return Object.assign(track, overrides);
    });

    tracks.forEach((track) => stream.addTrack(track));

    return stream;
  }

  function mockDeviceList(overrides: Array<Partial<MediaStreamTrack>> = []) {
    const stream = createMediaStream(overrides);
    MockMediaDevices.getUserMedia.mockResolvedValue(stream);

    return stream.getTracks();
  }

  function mockDisplayTracks(overrides: Array<Partial<MediaStreamTrack>> = []) {
    const stream = createMediaStream(overrides);
    MockMediaDevices.getDisplayMedia.mockResolvedValue(stream);

    return stream.getTracks();
  }

  beforeEach(() => {
    mockDeviceList([]);
  });

  describe('requestMediaDevices', () => {
    it('loads the tracks into the global context', async () => {
      const tracks = mockDeviceList([
        { label: 'Microphone', kind: TrackKind.Audio },
        { label: 'Camera', kind: TrackKind.Video },
      ]);

      await effects.devices.requestMediaDevices();

      expect(context.tracks.get(tracks[0].id)).toBe(tracks[0]);
      expect(context.tracks.get(tracks[1].id)).toBe(tracks[1]);
    });

    it('returns the track metadata', async () => {
      mockDeviceList([
        { label: 'Microphone', kind: TrackKind.Audio },
        { label: 'Camera', kind: TrackKind.Video },
      ]);

      const result = await effects.devices.requestMediaDevices();

      expect(result).toEqual([
        {
          kind: TrackKind.Audio,
          deviceId: expect.any(String),
          trackId: expect.any(String),
          enabled: expect.any(Boolean),
        },
        {
          kind: TrackKind.Video,
          deviceId: expect.any(String),
          trackId: expect.any(String),
          enabled: expect.any(Boolean),
        },
      ]);
    });

    it('sends the tracks to all remote connections', async () => {
      mockDeviceList([
        { label: 'Microphone', kind: TrackKind.Audio },
        { label: 'Camera', kind: TrackKind.Video },
      ]);

      const conn = new ConnectionManager({} as any); // Mock. Params are ignored.
      context.connections.set('remote-id', conn);
      await effects.devices.requestMediaDevices();

      expect(conn.addTrack).toHaveBeenCalledTimes(2);
    });

    it('removes the track when it ends unexpectedly', async () => {
      const [track] = mockDeviceList([
        { label: 'Camera', kind: TrackKind.Video },
      ]);

      await effects.devices.requestMediaDevices();
      await track.onended(new Event('ended'));

      expect(sdk.tracks.remove).toHaveBeenCalledWith({
        trackId: track.id,
        peerId: MY_PARTICIPANT_ID,
      });
    });
  });

  describe('shareScreen', () => {
    it('grabs the display media', async () => {
      mockDisplayTracks([{ label: 'Screen', kind: TrackKind.Video }]);

      const newTracks = await effects.devices.shareScreen();

      expect(newTracks).toEqual([
        {
          kind: TrackKind.Video,
          deviceId: expect.any(String),
          trackId: expect.any(String),
          enabled: expect.any(Boolean),
        },
      ]);
    });
  });

  describe('observe', () => {
    it('asynchronously yields every device changeset', async () => {
      const observer = effects.devices.observe();
      const createUpdate = () => ({
        changes: [],
        devices: [],
      });

      const update1 = createUpdate();
      const p1 = observer.next();
      MediaDevices.ondevicechange?.(update1);
      expect((await p1).value).toBe(update1);

      const update2 = createUpdate();
      const p2 = observer.next();
      MediaDevices.ondevicechange?.(update2);
      expect((await p2).value).toBe(update2);
    });
  });
});
