import localforage from 'localforage';
import StorageKey from '../utils/storage-keys';
import initialState, { WebrtcSettings } from '../reducers/initial-state';
import Logger from '../utils/logger';

const DEFAULT_SETTINGS = initialState.settings.webrtc;

const logger = new Logger('settings');

/**
 * Load the application settings from disk.
 */
export async function load(): Promise<WebrtcSettings> {
  const settings: null | WebrtcSettings = await localforage.getItem(
    StorageKey.WebrtcSettings,
  );

  if (!settings) {
    return DEFAULT_SETTINGS;
  }

  // Apply defaults as well. We may add new keys in the future.
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
  };
}

/**
 * Update some or all of the settings and save the changes to disk.
 */
export async function update(updates: Partial<WebrtcSettings>) {
  logger.debug('Updating WebRTC settings:', updates);

  const oldSettings = await load();

  await localforage.setItem(StorageKey.WebrtcSettings, {
    ...oldSettings,
    ...updates,
  });
}

export async function reset() {
  logger.debug('Clearing WebRTC settings.');

  await localforage.removeItem(StorageKey.WebrtcSettings);
}
