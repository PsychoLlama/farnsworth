import setup from '../../testing/redux';
import { PanelView } from '../initial-state';

describe('Settings reducer', () => {
  describe('open', () => {
    it('opens the settings panel', () => {
      const { store, sdk } = setup();

      sdk.settings.open();

      expect(store.getState().panel).toHaveProperty('view', PanelView.Settings);
    });
  });

  describe('close', () => {
    it('closes the settings panel', () => {
      const { store, sdk } = setup((state) => {
        state.panel.view = PanelView.Settings;
      });

      sdk.settings.close();

      expect(store.getState().panel).toHaveProperty('view', PanelView.None);
    });
  });

  describe('toggle', () => {
    it('toggles the settings panel', () => {
      const { store, sdk } = setup((state) => {
        state.panel.view = PanelView.Chat;
      });

      sdk.settings.toggle();
      expect(store.getState().panel).toHaveProperty('view', PanelView.Settings);

      sdk.settings.toggle();
      expect(store.getState().panel).toHaveProperty('view', PanelView.None);

      sdk.settings.toggle();
      expect(store.getState().panel).toHaveProperty('view', PanelView.Settings);
    });
  });
});
