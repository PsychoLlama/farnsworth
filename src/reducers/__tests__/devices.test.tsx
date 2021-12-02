import MediaDevices, {
  DeviceInfo,
  DeviceKind,
  DeviceChange,
  OperationType,
} from 'media-devices';
import setup from '../../testing/redux';
import * as actions from '../../actions';

jest.mock('media-devices');

const MockMediaDevices: jest.Mocked<typeof MediaDevices> = MediaDevices as any;

describe('Sources reducer', () => {
  beforeEach(() => {
    MockMediaDevices.enumerateDevices.mockResolvedValue([]);
  });

  function mockDeviceList(values: Array<Partial<DeviceInfo>>) {
    const devices: Array<DeviceInfo> = values.map((partialDevice, index) => ({
      groupId: 'group-id',
      deviceId: 'device-id',
      kind: DeviceKind.VideoInput,
      label: `Device #${index + 1}`,
      ...partialDevice,
    }));

    MockMediaDevices.enumerateDevices.mockResolvedValue(devices);

    return devices;
  }

  describe('devices.list()', () => {
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

  describe('devices.observe()', () => {
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
});
