import * as settingsEffects from '../../effects/settings';
import setup from '../../testing/redux';

jest.mock('../../effects/settings');

const mockedSettingsEffects: jest.Mocked<typeof settingsEffects> =
  settingsEffects as any;

describe('Settings reducer', () => {
  beforeEach(() => {
    mockedSettingsEffects.load.mockResolvedValue({
      forceTurnRelay: true,
      disableDefaultIceServers: true,
      customIceServers: [{ urls: 'stun:stun.example.com' }],
    });
  });

  describe('load', () => {
    it('saves the result in redux', async () => {
      const { store, sdk } = setup();

      await sdk.settings.load();

      expect(store.getState().settings.webrtc).toEqual({
        forceTurnRelay: true,
        disableDefaultIceServers: true,
        customIceServers: [{ urls: 'stun:stun.example.com' }],
      });
    });
  });

  describe('reset', () => {
    it('resets the redux state', async () => {
      const { store, sdk } = setup((state) => {
        state.settings.webrtc.forceTurnRelay = true;
      });

      await sdk.settings.reset();

      expect(store.getState().settings.webrtc).toHaveProperty(
        'forceTurnRelay',
        false,
      );
    });
  });

  describe('update', () => {
    it('merges the new settings', async () => {
      const { store, sdk } = setup();

      const patch = {
        forceTurnRelay: true,
        customIceServers: [{ urls: 'stun:example.com' }],
      };

      await sdk.settings.update(patch);

      expect(store.getState().settings.webrtc).toMatchObject(patch);
    });
  });
});
