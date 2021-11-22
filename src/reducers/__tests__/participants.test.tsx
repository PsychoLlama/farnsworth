import createStore from '../../utils/create-store';
import * as actions from '../../actions';
import * as deviceEffects from '../../effects/devices';
import {
  TrackKind,
  ConnectionState,
  MY_PARTICIPANT_ID,
} from '../../utils/constants';

jest.mock('../../effects/devices');
jest.mock('../../effects/tracks', () => {
  const actual = jest.requireActual('../../effects/tracks');

  return {
    ...(jest.genMockFromModule('../../effects/tracks') as any),
    add: actual.add,
  };
});

const mockedEffects: jest.Mocked<typeof deviceEffects> = deviceEffects as any;

describe('Participants reducer', () => {
  function setup() {
    const store = createStore();

    return {
      store,
    };
  }

  beforeEach(() => {
    mockedEffects.requestMediaDevices.mockResolvedValue([
      { kind: TrackKind.Audio, trackId: 'first', deviceId: 'mic' },
      { kind: TrackKind.Video, trackId: 'second', deviceId: 'cam' },
    ]);
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
});
