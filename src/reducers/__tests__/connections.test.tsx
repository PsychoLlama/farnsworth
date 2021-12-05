import * as connectionEffects from '../../effects/connections';
import setup from '../../testing/redux';
import { ConnectionState, TrackSource } from '../../utils/constants';
import * as factories from '../../testing/factories';

jest.mock('../../effects/connections');

const mockedConnectionEffects: jest.Mocked<typeof connectionEffects> =
  connectionEffects as any;

describe('Connections reducer', () => {
  beforeEach(() => {
    mockedConnectionEffects.close.mockImplementation((id) => id);
    mockedConnectionEffects.dial.mockResolvedValue({
      peerId: 'mock-peer-id',
    });

    mockedConnectionEffects.listen.mockResolvedValue({
      relayAddr: 'mock-server-address',
      id: 'mock-peer-id',
    });
  });

  describe('dial', () => {
    it('adds a new participant', async () => {
      const { store, sdk } = setup();

      await sdk.connections.dial('overridden-by-mock');

      expect(store.getState().call).toEqual({ peerId: 'mock-peer-id' });
      expect(store.getState().participants).toMatchObject({
        ['mock-peer-id']: {
          trackIds: [],
          isMe: false,
          connection: { state: ConnectionState.Connecting },
        },
      });
    });
  });

  describe('accept', () => {
    it('sets the active peer ID', async () => {
      const { store, sdk } = setup();

      sdk.connections.accept('mock-peer-id');

      expect(store.getState().call).toEqual({
        peerId: 'mock-peer-id',
      });
    });

    it('adds a new participant', async () => {
      const { store, sdk } = setup();

      const peerId = `Qm${Array(44).fill('Y').join('')}`;
      sdk.connections.accept(peerId);

      expect(store.getState().participants).toMatchObject({
        [peerId]: {
          trackIds: [],
          isMe: false,
          connection: { state: ConnectionState.Connecting },
        },
      });
    });

    it('does not wipe out state when reconnecting', async () => {
      const { store, sdk } = setup((state) => {
        state.participants['remote-peer'] = factories.Participant({
          connection: { state: ConnectionState.Disconnected },
          chat: {
            history: [factories.ChatMessage({ author: 'remote-peer' })],
          },
        });
      });

      sdk.connections.accept('remote-peer');

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

  describe('close', () => {
    it('updates the connection state', async () => {
      const { store, sdk } = setup((state) => {
        state.participants['remote-peer'] = factories.Participant({
          connection: { state: ConnectionState.Connected },
        });
      });

      sdk.connections.close('remote-peer');

      expect(store.getState().participants).toMatchObject({
        'remote-peer': {
          connection: { state: ConnectionState.Disconnected },
        },
      });
    });

    it('deletes the corresponding tracks', () => {
      const track = new MediaStreamTrack();
      const { store, sdk } = setup((state) => {
        state.participants.remote = factories.Participant({
          trackIds: [track.id],
        });

        state.tracks[track.id] = factories.Track({
          source: TrackSource.Device,
        });
      });

      sdk.connections.close('remote');

      expect(store.getState().tracks).toEqual({});
      expect(store.getState().participants).toMatchObject({
        remote: { trackIds: [] },
      });
    });
  });

  describe('markConnected', () => {
    it('updates the connection state', async () => {
      const { store, sdk } = setup((state) => {
        state.participants['remote-peer'] = factories.Participant({
          connection: { state: ConnectionState.Connecting },
        });
      });

      sdk.connections.markConnected('remote-peer');

      expect(store.getState().participants).toMatchObject({
        'remote-peer': {
          connection: { state: ConnectionState.Connected },
        },
      });
    });
  });

  describe('listen', () => {
    it('sets the local ID after connecting to the server', async () => {
      const { store, sdk } = setup();

      expect(store.getState().relay).toBeNull();
      await sdk.connections.listen('mocked-by-setup');
      expect(store.getState().relay).toEqual({
        server: 'mock-server-address',
        localId: 'mock-peer-id',
      });
    });
  });
});
