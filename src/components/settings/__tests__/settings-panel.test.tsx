import { DeviceInfo, DeviceKind } from 'media-devices';
import renderer from '../../../testing/renderer';
import { SettingsPanel, mapStateToProps } from '../settings-panel';
import initialState from '../../../reducers/initial-state';
import { STUN_SERVERS } from '../../../utils/constants';

describe('SettingsPanel', () => {
  beforeEach(() => {
    STUN_SERVERS.length = 0;
    STUN_SERVERS.push('stun.example.com');
  });

  function createSource(override?: Partial<DeviceInfo>): DeviceInfo {
    return {
      kind: DeviceKind.AudioInput,
      label: 'Device Label',
      groupId: 'group-id',
      deviceId: 'device-id',
      ...override,
    };
  }

  const setup = renderer(SettingsPanel, {
    getDefaultProps: () => ({
      panelId: 'settings-panel',
      changeDevice: jest.fn(),
      loadSettings: jest.fn(),
      selectedAudioDeviceId: 'a-id',
      selectedVideoDeviceId: 'v-id',
      audioSources: [createSource({ kind: DeviceKind.AudioInput })],
      videoSources: [
        createSource({ kind: DeviceKind.VideoInput }),
        createSource({ kind: DeviceKind.VideoInput }),
      ],
      forceTurnRelay: false,
      useDefaultIceServers: true,
      iceServers: [],
    }),
  });

  it('renders an option for every device', () => {
    const { findByTestId, props } = setup();

    expect(findByTestId('audio-source-option').length).toBe(
      props.audioSources.length,
    );

    expect(findByTestId('video-source-option').length).toBe(
      props.videoSources.length,
    );
  });

  it('disables the inputs if there are no options', () => {
    const { findByTestId } = setup({ audioSources: [], videoSources: [] });

    expect(findByTestId('choose-audio-source').prop('disabled')).toBe(true);
    expect(findByTestId('choose-video-source').prop('disabled')).toBe(true);
  });

  it('gets the new device when you request it', () => {
    const { findByTestId, props } = setup({
      videoSources: [createSource()],
    });

    const [video] = props.videoSources;
    findByTestId('choose-video-source').simulate('change', {
      currentTarget: { value: video.deviceId },
    });

    expect(props.changeDevice).toHaveBeenCalledWith({
      video: {
        deviceId: { exact: video.deviceId },
      },
    });
  });

  it('shows which devices are currently selected', () => {
    const { findByTestId } = setup({
      audioSources: [createSource(), createSource({ deviceId: 'a-active' })],
      videoSources: [createSource(), createSource({ deviceId: 'v-active' })],
      selectedAudioDeviceId: 'a-active',
      selectedVideoDeviceId: 'v-active',
    });

    expect(findByTestId('choose-audio-source').prop('value')).toBe('a-active');
    expect(findByTestId('choose-video-source').prop('value')).toBe('v-active');
  });

  it('renders every ice server url', () => {
    const { findByTestId } = setup({
      iceServers: [
        { urls: 'stun:stun.example.com' },
        { urls: ['stun:stun1.example.com', 'stun:stun2.example.com'] },
      ],
    });

    expect(findByTestId('ice-server-address').length).toBe(
      3 + STUN_SERVERS.length,
    );
  });

  it('loads app settings when you open the advanced panel', () => {
    const { findByTestId, props } = setup();

    findByTestId('advanced-settings').simulate('toggle', {
      currentTarget: { open: false },
    });

    expect(props.loadSettings).not.toHaveBeenCalled();

    findByTestId('advanced-settings').simulate('toggle', {
      currentTarget: { open: true },
    });

    expect(props.loadSettings).toHaveBeenCalled();
  });

  describe('mapStateToProps', () => {
    it('returns the expected props', () => {
      const props = mapStateToProps(initialState);

      expect(props).toMatchInlineSnapshot(`
        Object {
          "activeTracks": Array [],
          "audioSources": Array [],
          "forceTurnRelay": false,
          "iceServers": Array [],
          "selectedAudioDeviceId": "",
          "selectedVideoDeviceId": "",
          "useDefaultIceServers": true,
          "videoSources": Array [],
        }
      `);
    });
  });
});
