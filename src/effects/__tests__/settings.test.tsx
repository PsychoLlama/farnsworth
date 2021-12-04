import localforage from 'localforage';
import * as effects from '../../effects';
import StorageKey from '../../utils/storage-keys';

jest.mock('localforage');

const mockedLocalforage: jest.Mocked<typeof localforage> = localforage as any;

describe('Settings effects', () => {
  beforeEach(() => {
    mockedLocalforage.getItem.mockResolvedValue(null);
  });

  describe('load', () => {
    it('provides defaults when no settings were found', async () => {
      const settings = await effects.settings.load();

      expect(settings).toMatchObject({
        forceTurnRelay: false,
        customIceServers: [],
      });
    });

    it('returns the settings if they exist', async () => {
      mockedLocalforage.getItem.mockResolvedValue({
        forceTurnRelay: true,
      });

      const settings = await effects.settings.load();

      expect(settings).toEqual({
        forceTurnRelay: true,
        disableDefaultIceServers: false,
        customIceServers: [],
      });
    });
  });

  describe('update', () => {
    it('updates the settings', async () => {
      await effects.settings.update({
        forceTurnRelay: true,
        disableDefaultIceServers: true,
      });

      expect(mockedLocalforage.setItem).toHaveBeenCalledWith(
        StorageKey.WebrtcSettings,
        {
          forceTurnRelay: true,
          disableDefaultIceServers: true,
          customIceServers: [],
        },
      );
    });
  });

  describe('reset', () => {
    it('deletes the settings', async () => {
      await effects.settings.reset();

      expect(mockedLocalforage.removeItem).toHaveBeenCalledWith(
        StorageKey.WebrtcSettings,
      );
    });
  });
});
