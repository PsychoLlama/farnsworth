import createStore from '../../utils/create-store';
import * as actions from '../../actions';
import * as deviceEffects from '../../effects/devices';
import * as chatEffects from '../../effects/chat';
import {
  TrackKind,
  ConnectionState,
  MY_PARTICIPANT_ID,
} from '../../utils/constants';

jest.mock('../../effects/devices');
jest.mock('../../effects/chat');
jest.mock('../../effects/tracks', () => {
  const actual = jest.requireActual('../../effects/tracks');

  return {
    ...(jest.genMockFromModule('../../effects/tracks') as any),
    add: actual.add,
  };
});

const mockedEffects: jest.Mocked<typeof deviceEffects> = deviceEffects as any;
const mockedChatEffects: jest.Mocked<typeof chatEffects> = chatEffects as any;

describe('Participants reducer', () => {
  function setup() {
    const store = createStore();

    return {
      store,
    };
  }

  beforeEach(() => {
    mockedEffects.requestMediaDevices.mockResolvedValue([
      {
        kind: TrackKind.Audio,
        trackId: 'first',
        deviceId: 'mic',
        enabled: true,
      },
      {
        kind: TrackKind.Video,
        trackId: 'second',
        deviceId: 'cam',
        enabled: true,
      },
    ]);

    mockedChatEffects.sendMessage.mockImplementation((e) => e);
  });

  describe('requestMediaDevices()', () => {
    it('puts the track IDs on tha participant', async () => {
      const { store } = setup();

      await store.dispatch(actions.devices.requestMediaDevices());

      const { participants } = store.getState();
      expect(participants[MY_PARTICIPANT_ID]).toMatchObject({
        trackIds: ['first', 'second'],
      });
    });
  });

  describe('dial()', () => {
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

  describe('accept()', () => {
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

      const peerId = `Qm${Array(44).fill('Y').join('')}`;
      await store.dispatch(actions.connections.accept(peerId));
      store.dispatch(actions.connections.markDisconnected(peerId));
      store.dispatch(
        actions.chat.receiveMessage({
          author: peerId,
          sentDate: 'the-future',
          body: 'Marty!',
        }),
      );

      await store.dispatch(actions.connections.accept(peerId));

      expect(store.getState().participants).toMatchObject({
        [peerId]: {
          connection: { state: ConnectionState.Connecting },
          chat: {
            history: expect.arrayContaining([
              expect.objectContaining({ author: peerId }),
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

  describe('connections.markDisconnected()', () => {
    it('updates the connection state', () => {
      const { store } = setup();

      store.dispatch(actions.connections.markDisconnected(MY_PARTICIPANT_ID));

      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          connection: { state: ConnectionState.Disconnected },
        },
      });
    });
  });

  describe('connections.markConnected()', () => {
    it('updates the connection state', () => {
      const { store } = setup();

      store.dispatch(actions.connections.markDisconnected(MY_PARTICIPANT_ID));
      store.dispatch(actions.connections.markConnected(MY_PARTICIPANT_ID));

      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          connection: { state: ConnectionState.Connected },
        },
      });
    });

    it('removes all the tracks', () => {
      const { store } = setup();

      store.dispatch(
        actions.tracks.add({
          track: new MediaStreamTrack(),
          peerId: MY_PARTICIPANT_ID,
        }),
      );

      store.dispatch(actions.connections.markDisconnected(MY_PARTICIPANT_ID));

      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          trackIds: [],
        },
      });
    });
  });

  describe('chat.sendMessage', () => {
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

  describe('chat.receiveMessage', () => {
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
});
