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

  describe('settings.load()', () => {
    it('saves the result in redux', async () => {
      const { store, sdk } = setup();

      await sdk.settings.load();

      expect(store.getState().settings).toEqual({
        forceTurnRelay: true,
        disableDefaultIceServers: true,
        customIceServers: [{ urls: 'stun:stun.example.com' }],
      });
    });
  });

  describe('settings.reset()', () => {
    it('resets the redux state', async () => {
      const { store, sdk } = setup((state) => {
        state.settings.forceTurnRelay = true;
      });

      await sdk.settings.reset();

      expect(store.getState().settings).toHaveProperty('forceTurnRelay', false);
    });
  });
});
