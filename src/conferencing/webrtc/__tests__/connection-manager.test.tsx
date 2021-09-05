import ConnectionManager, { Config, MessageType } from '../connection-manager';
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

  it('creates a peer', () => {
    const { mgr } = setup();

    expect(mgr.channel).toBeInstanceOf(MockRTCDataChannel);
  });

  it('sends ICE candidates to the remote peer', () => {
    const { pc, signaler } = setup();

    const candidate = { mock: 'ICE-candidate' };
    pc.onicecandidate({ candidate });

    expect(signaler.send).toHaveBeenCalledWith({
      type: MessageType.IceCandidate,
      payload: candidate,
    });
  });

  it('negotiates session details when required', async () => {
    const { pc, signaler } = setup();

    expect(pc.setLocalDescription).not.toHaveBeenCalled();
    await pc.onnegotiationneeded();
    expect(pc.setLocalDescription).toHaveBeenCalled();

    expect(signaler.send).toHaveBeenCalledWith({
      type: MessageType.SessionDescription,
      payload: pc.localDescription,
    });
  });

  describe('events', () => {
    it('forwards the track-added event', () => {
      const { pc, config } = setup();
      const track = new MockMediaStreamTrack();

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
