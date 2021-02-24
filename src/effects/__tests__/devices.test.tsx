import MediaDevices from 'media-devices';
import * as effects from '../devices';
import { TrackKind } from '../../utils/constants';

jest.mock('media-devices');

const MockMediaDevices: jest.Mocked<typeof MediaDevices> = MediaDevices as any;

describe('Device effects', () => {
  function setup(overrides: Array<Partial<MediaStreamTrack>> = []) {
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
    setup([]);
  });

  describe('requestMediaDevices', () => {
    it('loads the tracks into state', async () => {
      const tracks = setup([
        { label: 'Microphone', kind: TrackKind.Audio },
        { label: 'Camera', kind: TrackKind.Video },
      ]);

      const result = await effects.requestMediaDevices();

      expect(result).toMatchObject({
        tracks: tracks.map((t) => t.id),
      });
    });
  });
});
