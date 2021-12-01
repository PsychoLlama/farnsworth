import createStore from '../../utils/create-store';
import * as actions from '../../actions';
import { PanelView } from '../initial-state';

describe('Settings reducer', () => {
  describe('open', () => {
    it('opens the settings panel', () => {
      const store = createStore();
      store.dispatch(actions.settings.open());

      expect(store.getState().panel).toHaveProperty('view', PanelView.Settings);
    });
  });

  describe('close', () => {
    it('closes the settings panel', () => {
      const store = createStore();

      store.dispatch(
        actions.tools.patch((state) => {
          state.panel.view = PanelView.Settings;
        }),
      );

      store.dispatch(actions.settings.close());

      expect(store.getState().panel).toHaveProperty('view', PanelView.None);
    });
  });

  describe('toggle', () => {
    it('toggles the settings panel', () => {
      const store = createStore();
      store.dispatch(
        actions.tools.patch((state) => {
          state.panel.view = PanelView.Chat;
        }),
      );

      store.dispatch(actions.settings.toggle());
      expect(store.getState().panel).toHaveProperty('view', PanelView.Settings);

      store.dispatch(actions.settings.toggle());
      expect(store.getState().panel).toHaveProperty('view', PanelView.None);

      store.dispatch(actions.settings.toggle());
      expect(store.getState().panel).toHaveProperty('view', PanelView.Settings);
    });
  });
});
