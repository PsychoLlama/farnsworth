import MediaDevices, { DeviceInfo, DeviceKind } from 'media-devices';
import setup from '../../testing/redux';

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
  });
});
