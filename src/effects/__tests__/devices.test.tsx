import MediaDevices from 'media-devices';
import * as effects from '../';
import { TrackKind } from '../../utils/constants';
import context from '../../conferencing/global-context';
import ConnectionManager from '../../conferencing/webrtc';

jest.mock('media-devices');
jest.mock('../../conferencing/webrtc');

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
});
