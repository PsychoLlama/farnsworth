import setup from '../../testing/redux';
import { PanelView } from '../initial-state';

describe('Panel reducer', () => {
  describe('open', () => {
    it('opens the panel', () => {
      const { store, sdk } = setup((state) => {
        state.call = {
          peerId: 'remote-peer',
        };
      });

      sdk.panel.open();

      expect(store.getState().panel).toMatchObject({
        view: store.getState().panel.lastView,
      });
    });

    it('avoids the chat panel if no call is not in progress', () => {
      const { store, sdk } = setup((state) => {
        state.panel.lastView = PanelView.Chat;
        state.call = null;
      });

      sdk.panel.open();

      expect(store.getState().panel).toHaveProperty('view', PanelView.Settings);
    });
  });

  describe('close', () => {
    it('closes the panel', () => {
      const { store, sdk } = setup((state) => {
        state.panel.view = PanelView.Settings;
      });

      sdk.panel.close();

      expect(store.getState().panel).toMatchObject({
        view: PanelView.None,
      });
    });
  });

  describe('toggle', () => {
    it('toggles the panel between the last view', () => {
      const { store, sdk } = setup((state) => {
        state.panel.lastView = PanelView.Settings;
        state.panel.view = PanelView.Settings;
      });

      sdk.panel.toggle();
      expect(store.getState().panel).toHaveProperty('view', PanelView.None);

      sdk.panel.toggle();
      expect(store.getState().panel).toHaveProperty('view', PanelView.Settings);
    });

    it('avoids opening the chat panel without an active call', () => {
      const { store, sdk } = setup((state) => {
        state.call = null;
        state.panel.lastView = PanelView.Chat;
      });

      sdk.panel.toggle();

      expect(store.getState().panel).toHaveProperty('view', PanelView.Settings);
    });

    it('clears the unread chat count when toggling to the chat panel', () => {
      const { store, sdk } = setup((state) => {
        state.call = { peerId: 'remote-peer' };
        state.chat.unreadMessages = true;
      });

      sdk.panel.toggle();

      expect(store.getState().chat).toHaveProperty('unreadMessages', false);
    });
  });

  describe('showChat', () => {
    it('shows the chat panel', () => {
      const { store, sdk } = setup((state) => {
        state.panel.lastView = PanelView.Settings;
      });

      sdk.panel.showChat();

      expect(store.getState().panel).toMatchObject({
        lastView: PanelView.Chat,
        view: PanelView.Chat,
      });
    });

    it('clears the unread badge', () => {
      const { store, sdk } = setup((state) => {
        state.chat.unreadMessages = true;
      });

      sdk.panel.showChat();

      expect(store.getState().chat).toHaveProperty('unreadMessages', false);
    });
  });

  describe('showSettings', () => {
    it('shows the settings panel', () => {
      const { store, sdk } = setup((state) => {
        state.panel.lastView = PanelView.Chat;
      });

      sdk.panel.showSettings();

      expect(store.getState().panel).toMatchObject({
        lastView: PanelView.Settings,
        view: PanelView.Settings,
      });
    });
  });
});
