import createStore from '../../utils/create-store';
import * as actions from '../../actions';
import * as connEffects from '../../effects/connections';
import * as deviceEffects from '../../effects/devices';
import {
  TrackKind,
  TrackSource,
  MY_PARTICIPANT_ID,
} from '../../utils/constants';

jest.mock('../../effects/connections');
jest.mock('../../effects/devices');

const mockedConnEffects: jest.Mocked<typeof connEffects> = connEffects as any;
const mockedDeviceEffects: jest.Mocked<typeof deviceEffects> =
  deviceEffects as any;

describe('Tracks reducer', () => {
  function setup() {
    const store = createStore();

    return {
      store,
    };
  }

  beforeEach(() => {
    mockedConnEffects.close.mockImplementation((id) => id);
    mockedDeviceEffects.requestMediaDevices.mockResolvedValue([
      {
        kind: TrackKind.Audio,
        trackId: 'first',
        deviceId: 'mic',
        enabled: true,
      },
      {
        kind: TrackKind.Video,
        trackId: 'second',
        deviceId: 'cam',
        enabled: true,
      },
    ]);
  });

  describe('devices.requestMediaDevices()', () => {
    it('adds the new tracks', async () => {
      const { store } = setup();
      await store.dispatch(actions.devices.requestMediaDevices());

      expect(store.getState().tracks).toMatchInlineSnapshot(`
        Object {
          "first": Object {
            "enabled": true,
            "kind": "audio",
            "local": true,
            "source": "device",
          },
          "second": Object {
            "enabled": true,
            "kind": "video",
            "local": true,
            "source": "device",
          },
        }
      `);
    });

    it('puts the track IDs on tha participant', async () => {
      const { store } = setup();

      await store.dispatch(actions.devices.requestMediaDevices());

      const { participants } = store.getState();
      expect(participants[MY_PARTICIPANT_ID]).toMatchObject({
        trackIds: ['first', 'second'],
      });
    });
  });

  describe('tracks.add()', () => {
    it('indexes the track with the others', () => {
      const { store } = setup();

      const track = new MediaStreamTrack();
      store.dispatch(
        actions.tracks.add({
          track,
          source: TrackSource.Device,
          peerId: MY_PARTICIPANT_ID,
        }),
      );

      expect(store.getState().tracks).toMatchObject({
        [track.id]: { kind: track.kind, enabled: track.enabled, local: false },
      });
    });
  });

  describe('tracks.pause()', () => {
    it('marks the track disabled', () => {
      const { store } = setup();

      const track = new MediaStreamTrack();
      track.enabled = true;

      store.dispatch(
        actions.tracks.add({
          track,
          source: TrackSource.Device,
          peerId: MY_PARTICIPANT_ID,
        }),
      );

      store.dispatch(actions.tracks.pause(track.id));

      expect(store.getState().tracks).toMatchObject({
        [track.id]: { enabled: false },
      });
    });
  });

  describe('tracks.resume()', () => {
    it('marks the track disabled', () => {
      const { store } = setup();

      const track = new MediaStreamTrack();
      track.enabled = false;

      store.dispatch(
        actions.tracks.add({
          track,
          source: TrackSource.Display,
          peerId: MY_PARTICIPANT_ID,
        }),
      );

      store.dispatch(actions.tracks.resume(track.id));

      expect(store.getState().tracks).toMatchObject({
        [track.id]: { enabled: true },
      });
    });
  });

  describe('tracks.toggle()', () => {
    it('marks the track disabled', () => {
      const { store } = setup();

      const track = new MediaStreamTrack();
      track.enabled = true;

      store.dispatch(
        actions.tracks.add({
          track,
          source: TrackSource.Device,
          peerId: MY_PARTICIPANT_ID,
        }),
      );

      store.dispatch(actions.tracks.toggle(track.id));

      expect(store.getState().tracks).toMatchObject({
        [track.id]: { enabled: false },
      });
    });
  });

  describe('tracks.markPaused()', () => {
    it('marks all remote streams of the same kind as paused', () => {
      const { store } = setup();

      const track = new MediaStreamTrack();
      track.enabled = true;

      store.dispatch(
        actions.tracks.add({
          track,
          source: TrackSource.Device,
          peerId: MY_PARTICIPANT_ID,
        }),
      );

      store.dispatch(actions.tracks.markPaused(track.kind as TrackKind));

      expect(store.getState().tracks).toMatchObject({
        [track.id]: { enabled: false },
      });
    });
  });

  describe('tracks.markResumed()', () => {
    it('marks all remote streams of the same kind as enabled', () => {
      const { store } = setup();

      const track = new MediaStreamTrack();
      track.enabled = false;

      store.dispatch(
        actions.tracks.add({
          track,
          source: TrackSource.Device,
          peerId: MY_PARTICIPANT_ID,
        }),
      );

      store.dispatch(actions.tracks.markResumed(track.kind as TrackKind));

      expect(store.getState().tracks).toMatchObject({
        [track.id]: { enabled: true },
      });
    });
  });

  describe('tracks.markEnded()', () => {
    it('removes the track', () => {
      const { store } = setup();

      store.dispatch(
        actions.tools.patch((state) => {
          state.participants[MY_PARTICIPANT_ID].trackIds = ['video-id'];
          state.tracks['video-id'] = {
            kind: TrackKind.Video,
            source: TrackSource.Device,
            local: true,
            enabled: true,
          };
        }),
      );

      store.dispatch(actions.tracks.markEnded('video-id'));

      expect(store.getState().tracks).toEqual({});
      expect(store.getState().participants[MY_PARTICIPANT_ID].trackIds).toEqual(
        [],
      );
    });
  });

  describe('connections.close()', () => {
    it('deletes the corresponding tracks', () => {
      const { store } = setup();

      const track = new MediaStreamTrack();
      store.dispatch(
        actions.tracks.add({
          track,
          source: TrackSource.Device,
          peerId: MY_PARTICIPANT_ID,
        }),
      );

      // This never happens in practice, I'm just lazy.
      store.dispatch(actions.connections.close(MY_PARTICIPANT_ID));

      expect(store.getState().tracks).toEqual({});
      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          trackIds: [],
        },
      });
    });
  });

  describe('call.leave()', () => {
    it('deletes the corresponding participant and all tracks', async () => {
      const { store } = setup();

      const track = new MediaStreamTrack();
      store.dispatch(
        actions.tracks.add({
          track,
          peerId: MY_PARTICIPANT_ID,
          source: TrackSource.Display,
        }),
      );

      store.dispatch(actions.call.leave(MY_PARTICIPANT_ID));

      expect(store.getState().tracks).toEqual({});
      expect(store.getState().participants).not.toHaveProperty(
        MY_PARTICIPANT_ID,
      );
    });
  });

  describe('devices.shareScreen()', () => {
    it('stores tracks in state', async () => {
      const { store } = setup();
      const track = new MediaStreamTrack();
      mockedDeviceEffects.shareScreen.mockResolvedValue([
        {
          trackId: track.id,
          kind: track.kind as TrackKind,
          deviceId: track.getSettings().deviceId,
          enabled: track.enabled,
        },
      ]);

      await store.dispatch(actions.devices.shareScreen());

      expect(store.getState().tracks).toHaveProperty(track.id);
      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          trackIds: [track.id],
        },
      });
    });
  });

  describe('devices.stopSharingScreen()', () => {
    it('removes local display tracks', async () => {
      const { store } = setup();
      const track = new MediaStreamTrack();
      mockedDeviceEffects.shareScreen.mockResolvedValue([
        {
          trackId: track.id,
          kind: track.kind as TrackKind,
          deviceId: track.getSettings().deviceId,
          enabled: track.enabled,
        },
      ]);

      await store.dispatch(actions.devices.shareScreen());
      store.dispatch(actions.devices.stopSharingScreen());

      expect(store.getState().tracks).not.toHaveProperty(track.id);
      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          trackIds: [],
        },
      });
    });
  });
});
