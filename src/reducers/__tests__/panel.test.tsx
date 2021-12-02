import setup from '../../testing/redux';
import { PanelView } from '../initial-state';
import * as factories from '../../testing/factories';

describe('Panel reducer', () => {
  describe('panel.open()', () => {
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

  describe('panel.close()', () => {
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

  describe('panel.toggle()', () => {
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

  describe('panel.showChat()', () => {
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

  describe('panel.showSettings()', () => {
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

  describe('call.leave()', () => {
    it('closes the panel if you had chat open', () => {
      const { store, sdk } = setup((state) => {
        state.panel.view = PanelView.Chat;
        state.call = { peerId: 'remote-id' };
        state.participants[state.call.peerId] = factories.Participant();
      });

      sdk.call.leave('remote-id');

      expect(store.getState().panel).toHaveProperty('view', PanelView.None);
    });

    it('leaves the panel open if you were looking at settings', () => {
      const { store, sdk } = setup((state) => {
        state.panel.view = PanelView.Settings;
        state.call = { peerId: 'remote-id' };
        state.participants[state.call.peerId] = factories.Participant();
      });

      sdk.call.leave('remote-id');

      expect(store.getState().panel).toHaveProperty('view', PanelView.Settings);
    });
  });
});
