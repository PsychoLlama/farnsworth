import {
  TrackKind,
  TrackSource,
  MY_PARTICIPANT_ID,
} from '../../utils/constants';
import * as trackEffects from '../../effects/tracks';
import * as factories from '../../testing/factories';
import setup from '../../testing/redux';

jest.mock('../../effects/tracks');

const mockedTrackEffects: jest.Mocked<typeof trackEffects> =
  trackEffects as any;

describe('Tracks reducer', () => {
  beforeEach(() => {
    mockedTrackEffects.pause.mockImplementation((id) => id);
    mockedTrackEffects.resume.mockImplementation((id) => id);
    mockedTrackEffects.toggle.mockImplementation((id) => id);
    mockedTrackEffects.add.mockImplementation(({ track, source, peerId }) => ({
      peerId,
      track: {
        id: track.id,
        kind: track.kind as TrackKind,
        enabled: track.enabled,
        source,
      },
    }));
  });

  describe('add', () => {
    it('indexes the track with the others', () => {
      const { store, sdk } = setup();

      const track = new MediaStreamTrack();
      sdk.tracks.add({
        track,
        source: TrackSource.Device,
        peerId: MY_PARTICIPANT_ID,
      });

      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          trackIds: [track.id],
        },
      });

      expect(store.getState().tracks).toMatchObject({
        [track.id]: { kind: track.kind, enabled: track.enabled, local: false },
      });
    });
  });

  describe('pause', () => {
    it('marks the track disabled', () => {
      const { store, sdk } = setup((state) => {
        state.tracks.track = factories.Track({ enabled: true });
      });

      sdk.tracks.pause('track');

      expect(store.getState().tracks).toMatchObject({
        track: { enabled: false },
      });
    });
  });

  describe('resume', () => {
    it('marks the track disabled', () => {
      const { store, sdk } = setup((state) => {
        state.tracks.track = factories.Track({ enabled: false });
      });

      sdk.tracks.resume('track');

      expect(store.getState().tracks).toMatchObject({
        track: { enabled: true },
      });
    });
  });

  describe('toggle', () => {
    it('marks the track disabled', () => {
      const { store, sdk } = setup((state) => {
        state.tracks.track = factories.Track({ enabled: true });
      });

      sdk.tracks.toggle('track');

      expect(store.getState().tracks).toMatchObject({
        track: { enabled: false },
      });
    });
  });

  describe('markPaused', () => {
    it('marks all remote streams of the same kind as paused', () => {
      const { store, sdk } = setup((state) => {
        state.tracks.track = factories.Track({
          kind: TrackKind.Video,
          enabled: true,
          local: false,
        });
      });

      sdk.tracks.markPaused(TrackKind.Video);

      expect(store.getState().tracks).toMatchObject({
        track: { enabled: false },
      });
    });
  });

  describe('markResumed', () => {
    it('marks all remote streams of the same kind as enabled', () => {
      const { store, sdk } = setup((state) => {
        state.tracks.track = factories.Track({
          kind: TrackKind.Audio,
          enabled: false,
          local: false,
        });
      });

      sdk.tracks.markResumed(TrackKind.Audio);

      expect(store.getState().tracks).toMatchObject({
        track: { enabled: true },
      });
    });
  });

  describe('remove', () => {
    it('removes the track', () => {
      const { store, sdk } = setup((state) => {
        state.participants[MY_PARTICIPANT_ID].trackIds = ['video-id'];
        state.tracks['video-id'] = factories.Track({
          kind: TrackKind.Video,
          source: TrackSource.Device,
        });
      });

      sdk.tracks.remove({ trackId: 'video-id', peerId: MY_PARTICIPANT_ID });

      expect(store.getState().tracks).toEqual({});
      expect(store.getState().participants[MY_PARTICIPANT_ID].trackIds).toEqual(
        [],
      );
    });
  });
});
