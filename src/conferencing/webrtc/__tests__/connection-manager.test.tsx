import ConnectionManager, { Config } from '../connection-manager';
import Libp2pMessenger from '../../libp2p-messenger';
import { Stream } from '../../../testing/mocks/libp2p';
import { MockMediaStreamTrack } from '../../../testing/mocks/media';
import {
  MockRTCDataChannel,
  MockRTCPeerConnection,
} from '../../../testing/mocks/webrtc';

describe('ConnectionManager', () => {
  function setup(override?: Partial<Config>) {
    const stream = new Stream();
    const signaler = Libp2pMessenger.from(stream);

    jest.spyOn(signaler, 'send');

    const config = {
      localId: 'local',
      remoteId: 'remote',
      signaler,
      events: {
        onTrack: jest.fn(),
      },
      ...override,
    };

    const mgr = new ConnectionManager(config);

    return {
      config,
      mgr,
      signaler,
      stream,

      // Technically private. Sue me.
      pc: (mgr as any).pc as MockRTCPeerConnection,
    };
  }

  it('creates a peer', async () => {
    const { mgr } = setup();

    const dc = await mgr.connect();

    expect(dc).toBeInstanceOf(MockRTCDataChannel);
  });

  describe('events', () => {
    it('forwards the track-added event', async () => {
      const { mgr, pc, config } = setup();
      const track = new MockMediaStreamTrack();

      await mgr.connect();
      pc.ontrack({ track });

      expect(config.events.onTrack).toHaveBeenCalledWith({
        peerId: config.remoteId,
        track,
      });
    });
  });

  describe('addTrack', () => {
    it('adds a track to the peer connection', () => {
      const { mgr, pc } = setup();
      const track = new MockMediaStreamTrack();

      mgr.addTrack(track);

      expect(pc.addTrack).toHaveBeenCalledWith(track);
    });
  });
});
