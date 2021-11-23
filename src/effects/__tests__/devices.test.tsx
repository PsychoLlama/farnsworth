import MediaDevices from 'media-devices';
import * as effects from '../devices';
import { TrackKind } from '../../utils/constants';
import context from '../../conferencing/global-context';

jest.mock('media-devices');

const MockMediaDevices: jest.Mocked<typeof MediaDevices> = MediaDevices as any;

describe('Device effects', () => {
  function mockDeviceList(overrides: Array<Partial<MediaStreamTrack>> = []) {
    const stream = new MediaStream();
    const tracks = overrides.map((overrides) => {
      const track = new MediaStreamTrack();
      return Object.assign(track, overrides);
    });

    tracks.forEach((track) => stream.addTrack(track));
    MockMediaDevices.getUserMedia.mockResolvedValue(stream);

    return tracks;
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

      await effects.requestMediaDevices();

      expect(context.tracks.get(tracks[0].id)).toBe(tracks[0]);
      expect(context.tracks.get(tracks[1].id)).toBe(tracks[1]);
    });

    it('returns the track metadata', async () => {
      mockDeviceList([
        { label: 'Microphone', kind: TrackKind.Audio },
        { label: 'Camera', kind: TrackKind.Video },
      ]);

      const result = await effects.requestMediaDevices();

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
  });
});
