import setup from '../../testing/redux';
import { MY_PARTICIPANT_ID, TrackSource } from '../../utils/constants';
import { PanelView } from '../../reducers/initial-state';
import * as factories from '../../testing/factories';

describe('Call reducer', () => {
  describe('leave', () => {
    it('leaves the call', async () => {
      const { store, sdk } = setup();

      sdk.connections.accept('mock-peer-id');
      sdk.call.leave('mock-peer-id');

      expect(store.getState().call).toBeNull();
    });

    it('closes the chat panel and clears the unread notice', () => {
      const { store, sdk } = setup((state) => {
        state.chat.unreadMessages = true;
      });

      sdk.call.leave(MY_PARTICIPANT_ID);

      expect(store.getState().chat).toHaveProperty('unreadMessages', false);
      expect(store.getState().panel).toMatchObject({
        view: PanelView.None,
      });
    });

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

    it('deletes the corresponding participant and all tracks', async () => {
      const track = new MediaStreamTrack();
      const { store, sdk } = setup((state) => {
        state.participants.remote = factories.Participant({
          trackIds: [track.id],
        });

        state.tracks[track.id] = factories.Track({
          source: TrackSource.Display,
        });
      });

      sdk.call.leave('remote');

      expect(store.getState().tracks).toEqual({});
      expect(store.getState().participants).not.toHaveProperty('remote');
    });
  });
});
