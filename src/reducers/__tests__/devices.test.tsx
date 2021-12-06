import MediaDevices, {
  DeviceInfo,
  DeviceKind,
  DeviceChange,
  OperationType,
} from 'media-devices';
import setup from '../../testing/redux';
import * as actions from '../../actions';
import * as factories from '../../testing/factories';
import * as deviceEffects from '../../effects/devices';
import {
  TrackSource,
  TrackKind,
  DeviceError,
  MY_PARTICIPANT_ID,
} from '../../utils/constants';

jest.mock('media-devices');
jest.mock('../../effects/devices');

const MockedMediaDevices: jest.Mocked<typeof MediaDevices> =
  MediaDevices as any;

const mockedDeviceEffects: jest.Mocked<typeof deviceEffects> =
  deviceEffects as any;

describe('Sources reducer', () => {
  beforeEach(() => {
    MockedMediaDevices.enumerateDevices.mockResolvedValue([]);
  });

  beforeEach(() => {
    mockedDeviceEffects.requestMediaDevices.mockResolvedValue([
      {
        kind: TrackKind.Audio,
        trackId: 'first',
        enabled: true,
        deviceId: 'mic',
        groupId: 'webcam',
        facingMode: null,
      },
      {
        kind: TrackKind.Video,
        trackId: 'second',
        enabled: true,
        deviceId: 'cam',
        groupId: 'webcam',
        facingMode: 'user',
      },
    ]);
  });

  function mockDeviceList(values: Array<Partial<DeviceInfo>>) {
    const devices: Array<DeviceInfo> = values.map((partialDevice, index) => ({
      groupId: 'group-id',
      deviceId: 'device-id',
      kind: DeviceKind.VideoInput,
      label: `Device #${index + 1}`,
      ...partialDevice,
    }));

    MockedMediaDevices.enumerateDevices.mockResolvedValue(devices);

    return devices;
  }

  describe('list', () => {
    it('splits the list into audio and video devices', async () => {
      const { store, sdk } = setup();

      const [audio, video] = mockDeviceList([
        { kind: DeviceKind.AudioInput },
        { kind: DeviceKind.VideoInput },
        { kind: DeviceKind.AudioOutput },
      ]);

      await sdk.devices.list();

      expect(store.getState().sources.available).toMatchObject({
        audio: [audio],
        video: [video],
      });
    });

    it('filters devices with duplicate IDs', async () => {
      const { store, sdk } = setup();

      const [video] = mockDeviceList([
        { kind: DeviceKind.VideoInput, deviceId: 'same-id' },
        { kind: DeviceKind.VideoInput, deviceId: 'same-id' },
      ]);

      await sdk.devices.list();

      expect(store.getState().sources.available).toMatchObject({
        video: [video],
      });
    });
  });

  describe('observe', () => {
    it('puts the device list', async () => {
      const { store } = setup();

      const devices = mockDeviceList([
        { kind: DeviceKind.AudioInput },
        { kind: DeviceKind.VideoInput },
        { kind: DeviceKind.AudioOutput },
      ]);

      const [audio, video] = devices;
      const changes = [
        { type: OperationType.Add, device: audio } as DeviceChange,
      ];

      store.dispatch(
        actions.devices.observe.actionFactory.success({ devices, changes }),
      );

      expect(store.getState().sources.changes).toBe(changes);
      expect(store.getState().sources.available).toMatchObject({
        audio: [audio],
        video: [video],
      });
    });
  });

  describe('requestMediaDevices', () => {
    it('adds the new tracks', async () => {
      const { store, sdk } = setup();
      await sdk.devices.requestMediaDevices({});

      expect(store.getState().tracks).toMatchInlineSnapshot(`
        Object {
          "first": Object {
            "deviceId": "mic",
            "enabled": true,
            "facingMode": null,
            "groupId": "webcam",
            "kind": "audio",
            "local": true,
            "source": "device",
          },
          "second": Object {
            "deviceId": "cam",
            "enabled": true,
            "facingMode": "user",
            "groupId": "webcam",
            "kind": "video",
            "local": true,
            "source": "device",
          },
        }
      `);
    });

    it('puts the track IDs on tha participant', async () => {
      const { store, sdk } = setup();

      await sdk.devices.requestMediaDevices({});

      const { participants } = store.getState();
      expect(participants[MY_PARTICIPANT_ID]).toMatchObject({
        trackIds: ['first', 'second'],
      });
    });

    it('replaces existing tracks of the same kind and source', async () => {
      mockedDeviceEffects.requestMediaDevices.mockResolvedValue([
        {
          kind: TrackKind.Video,
          trackId: 'new-video',
          enabled: true,
          deviceId: 'mic',
          groupId: 'webcam',
          facingMode: 'user',
        },
      ]);

      const { store, sdk } = setup((state) => {
        state.participants[MY_PARTICIPANT_ID].trackIds = [
          'audio',
          'video',
          'screen',
        ];

        state.tracks = {
          audio: factories.Track({ kind: TrackKind.Audio }),
          video: factories.Track({ kind: TrackKind.Video }),
          screen: factories.Track({
            kind: TrackKind.Video,
            source: TrackSource.Display,
          }),
        };
      });

      await sdk.devices.requestMediaDevices({ video: true });

      expect(store.getState().tracks).toEqual({
        'new-video': expect.anything(),
        screen: expect.anything(),
        audio: expect.anything(),
      });
    });

    it('stores the error code in redux', async () => {
      const { store, sdk } = setup();

      const error = new deviceEffects.GumError(
        new DOMException('Testing GUM errors', 'NotAllowedError'),
      );

      error.type = DeviceError.NotAllowed;
      mockedDeviceEffects.requestMediaDevices.mockRejectedValue(error);

      await expect(
        sdk.devices.requestMediaDevices({ video: true }),
      ).rejects.toBeDefined();

      expect(store.getState().sources.error).toBe(DeviceError.NotAllowed);
    });
  });

  describe('shareScreen', () => {
    it('stores tracks in state', async () => {
      const { store, sdk } = setup();

      const track = new MediaStreamTrack();
      mockedDeviceEffects.shareScreen.mockResolvedValue([
        {
          trackId: track.id,
          kind: track.kind as TrackKind,
          enabled: track.enabled,
          deviceId: track.getSettings().deviceId,
          groupId: track.getSettings().groupId,
          facingMode: null,
        },
      ]);

      await sdk.devices.shareScreen();

      expect(store.getState().tracks).toHaveProperty(track.id);
      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          trackIds: [track.id],
        },
      });
    });
  });

  describe('stopSharingScreen', () => {
    it('removes local display tracks', async () => {
      const track = new MediaStreamTrack();
      const { store, sdk } = setup((state) => {
        state.participants[MY_PARTICIPANT_ID].trackIds = [track.id];
        state.tracks[track.id] = factories.Track({
          source: TrackSource.Display,
        });
      });

      sdk.devices.stopSharingScreen();

      expect(store.getState().tracks).not.toHaveProperty(track.id);
      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          trackIds: [],
        },
      });
    });
  });

  describe('closeErrorModal', () => {
    it('clears the corresponding error', () => {
      const { store, sdk } = setup((state) => {
        state.sources.error = DeviceError.NotAllowed;
      });

      sdk.devices.closeErrorModal();

      expect(store.getState().sources).toHaveProperty('error', null);
    });
  });
});
