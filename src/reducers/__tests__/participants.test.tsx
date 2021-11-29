import createStore from '../../utils/create-store';
import * as actions from '../../actions';
import * as chatEffects from '../../effects/chat';
import { ConnectionState, MY_PARTICIPANT_ID } from '../../utils/constants';
import ConnectionManager from '../../conferencing/webrtc';
import context from '../../conferencing/global-context';

jest.mock('../../conferencing/webrtc');
jest.mock('../../effects/chat');
jest.mock('../../effects/tracks', () => {
  const actual = jest.requireActual('../../effects/tracks');

  return {
    ...(jest.genMockFromModule('../../effects/tracks') as any),
    add: actual.add,
  };
});

const mockedChatEffects: jest.Mocked<typeof chatEffects> = chatEffects as any;

describe('Participants reducer', () => {
  function setup() {
    const store = createStore();

    return {
      store,
    };
  }

  beforeEach(() => {
    mockedChatEffects.sendMessage.mockImplementation((e) => e);
    (ConnectionManager as any).mockImplementation(function (ctx: any) {
      this.remoteId = ctx.remoteId;
    });

    const mgr = new ConnectionManager({} as any);
    mgr.remoteId = 'remote-peer';
    context.connections.clear();
    context.connections.set('remote-peer', mgr);
  });

  describe('connections.dial()', () => {
    it('adds a new participant', async () => {
      const { store } = setup();

      const peerId = `Qm${Array(44).fill('Y').join('')}`;
      await store.dispatch(actions.connections.listen('/server'));
      await store.dispatch(
        actions.connections.dial(`/ip4/0.0.0.0/tcp/1/p2p/${peerId}`),
      );

      expect(store.getState().participants).toMatchObject({
        [peerId]: {
          trackIds: [],
          isMe: false,
          connection: { state: ConnectionState.Connecting },
        },
      });
    });
  });

  describe('connections.accept()', () => {
    it('adds a new participant', async () => {
      const { store } = setup();

      const peerId = `Qm${Array(44).fill('Y').join('')}`;
      await store.dispatch(actions.connections.accept(peerId));

      expect(store.getState().participants).toMatchObject({
        [peerId]: {
          trackIds: [],
          isMe: false,
          connection: { state: ConnectionState.Connecting },
        },
      });
    });

    it('does not wipe out state when reconnecting', async () => {
      const { store } = setup();

      await store.dispatch(actions.connections.accept('remote-peer'));
      store.dispatch(actions.connections.close('remote-peer'));
      store.dispatch(
        actions.chat.receiveMessage({
          author: 'remote-peer',
          sentDate: 'the-future',
          body: 'Marty!',
        }),
      );

      await store.dispatch(actions.connections.accept('remote-peer'));

      expect(store.getState().participants).toMatchObject({
        'remote-peer': {
          connection: { state: ConnectionState.Connecting },
          chat: {
            history: expect.arrayContaining([
              expect.objectContaining({ author: 'remote-peer' }),
            ]),
          },
        },
      });
    });
  });

  describe('tracks.add()', () => {
    it('adds the tracks to the right participant', () => {
      const { store } = setup();

      const track = new MediaStreamTrack();
      store.dispatch(
        actions.tracks.add({
          track,

          // Never happens in practice. This is just laziness.
          peerId: MY_PARTICIPANT_ID,
        }),
      );

      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          trackIds: [track.id],
        },
      });
    });
  });

  describe('connections.close()', () => {
    it('updates the connection state', async () => {
      const { store } = setup();

      await store.dispatch(actions.connections.accept('remote-peer'));
      store.dispatch(actions.connections.close('remote-peer'));

      expect(store.getState().participants).toMatchObject({
        'remote-peer': {
          connection: { state: ConnectionState.Disconnected },
        },
      });
    });
  });

  describe('connections.markConnected()', () => {
    it('updates the connection state', async () => {
      const { store } = setup();

      await store.dispatch(actions.connections.accept('remote-peer'));
      store.dispatch(actions.connections.close('remote-peer'));
      store.dispatch(actions.connections.markConnected('remote-peer'));

      expect(store.getState().participants).toMatchObject({
        'remote-peer': {
          connection: { state: ConnectionState.Connected },
        },
      });
    });
  });

  describe('chat.sendMessage()', () => {
    it('puts the message in redux', () => {
      const { store } = setup();

      const msg = {
        body: 'hi',
        author: MY_PARTICIPANT_ID,
        sentDate: new Date().toISOString(),
      };

      store.dispatch(
        actions.chat.sendMessage({
          remoteId: MY_PARTICIPANT_ID,
          msg,
        }),
      );

      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          chat: { history: [msg] },
        },
      });
    });
  });

  describe('chat.receiveMessage()', () => {
    it('puts the message in redux', () => {
      const { store } = setup();

      const msg = {
        body: 'hi',
        author: MY_PARTICIPANT_ID,
        sentDate: new Date().toISOString(),
      };

      store.dispatch(actions.chat.receiveMessage(msg));

      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          chat: { history: [msg] },
        },
      });
    });

    it('sorts the messages by sent date', () => {
      const { store } = setup();

      const first = {
        body: 'first',
        author: MY_PARTICIPANT_ID,
        sentDate: '2020-06-15',
      };

      const second = {
        body: 'second',
        author: MY_PARTICIPANT_ID,
        sentDate: '2020-09-20',
      };

      // Dispatch out of order.
      store.dispatch(actions.chat.receiveMessage(second));
      store.dispatch(actions.chat.receiveMessage(first));

      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          chat: { history: [first, second] },
        },
      });
    });
  });

  describe('call.leave()', () => {
    it('deletes the corresponding participant', async () => {
      const { store } = setup();

      await store.dispatch(actions.connections.accept('remote-peer'));
      store.dispatch(actions.call.leave('remote-peer'));

      expect(store.getState().participants).not.toHaveProperty('remote-peer');
    });
  });
});
