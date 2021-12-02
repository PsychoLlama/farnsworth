import localforage from 'localforage';
import StorageKey from '../utils/storage-keys';
import initialState, { Settings } from '../reducers/initial-state';

const DEFAULT_SETTINGS = initialState.settings;

/**
 * Load the application settings from disk.
 */
export async function load(): Promise<Settings> {
  const settings: null | Settings = await localforage.getItem(
    StorageKey.Settings,
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
export async function update(updates: Partial<Settings>) {
  const oldSettings = await load();

  await localforage.setItem(StorageKey.Settings, {
    ...oldSettings,
    ...updates,
  });
}
