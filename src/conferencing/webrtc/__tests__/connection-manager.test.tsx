import ConnectionManager, {
  Config,
  MessageType,
  IceLogger,
} from '../connection-manager';
import Libp2pMessenger from '../../libp2p-messenger';
import { Stream } from '../../../testing/mocks/libp2p';
import { MockMediaStreamTrack } from '../../../testing/mocks/media';
import {
  RtcDescriptionType,
  RtcSignalingState,
  TrackSource,
} from '../../../utils/constants';
import {
  MockRTCPeerConnection,
  MockRTCRtpSender,
} from '../../../testing/mocks/webrtc';
import sdk from '../../../utils/sdk';

jest.mock('../../../utils/sdk');
jest.mock('../data-channel-messenger');

describe('ConnectionManager', () => {
  async function setup(override?: Partial<Config>) {
    const stream = new Stream();
    const signaler = Libp2pMessenger.from(stream);

    jest.spyOn(signaler, 'send');
    jest.spyOn(signaler, 'subscribe');

    const config = {
      localId: 'local',
      remoteId: 'remote',
      signaler,
      ...override,
    };

    const mgr = await ConnectionManager.create(config);

    return {
      config,
      mgr,
      signaler,
      stream,
      onMessage: (signaler as any).subscribe.mock.calls[0][0],

      // Technically private. Sue me.
      pc: (mgr as any).pc as MockRTCPeerConnection,
    };
  }

  it('sends ICE candidates to the remote peer', async () => {
    const { pc, signaler } = await setup();

    const candidate = { mock: 'ICE-candidate' };
    pc.onicecandidate({ candidate });

    expect(signaler.send).toHaveBeenCalledWith({
      type: MessageType.IceCandidate,
      payload: candidate,
    });
  });

  it('negotiates session details when required', async () => {
    const { pc, signaler } = await setup();

    expect(pc.setLocalDescription).not.toHaveBeenCalled();
    await pc.onnegotiationneeded();
    expect(pc.setLocalDescription).toHaveBeenCalled();

    expect(signaler.send).toHaveBeenCalledWith({
      type: MessageType.SessionDescription,
      payload: pc.localDescription,
    });
  });

  it('sets the remote description for incoming offers', async () => {
    const { pc, onMessage } = await setup();
    const description = { type: 'answer' };

    await onMessage({
      type: MessageType.SessionDescription,
      payload: description,
    });

    expect(pc.setRemoteDescription).toHaveBeenCalledWith(description);
  });

  it('adds remote ICE candidates', async () => {
    const { pc, onMessage } = await setup();
    const candidate = { mock: 'ice-candidate' };

    await onMessage({
      type: MessageType.IceCandidate,
      payload: candidate,
    });

    expect(pc.addIceCandidate).toHaveBeenCalledWith(candidate);
  });

  it('ignores malformed messages', async () => {
    const { onMessage } = await setup();

    await expect(onMessage(null)).resolves.toBeUndefined();
    await expect(onMessage({})).resolves.toBeUndefined();
    await expect(onMessage({ type: '???' })).resolves.toBeUndefined();
  });

  it('responds to session offers async (inbound calls)', async () => {
    const { onMessage, pc } = await setup();

    await onMessage({
      type: MessageType.SessionDescription,
      payload: { type: RtcDescriptionType.Offer },
    });

    expect(pc.setLocalDescription).toHaveBeenCalled();
  });

  it('ignores remote offers during a conflict if impolite', async () => {
    const { onMessage, pc } = await setup({ localId: 'z', remoteId: 'a' });

    pc.onnegotiationneeded(); // No 'await' - test concurrent conditions.
    pc.signalingState = RtcSignalingState.HaveLocalOffer;

    await onMessage({
      type: MessageType.SessionDescription,
      payload: { type: RtcDescriptionType.Offer },
    });

    expect(pc.setRemoteDescription).not.toHaveBeenCalled();
    expect(pc.setLocalDescription).toHaveBeenCalledTimes(1);
  });

  it('drops local offers during a conflict if polite', async () => {
    const { onMessage, pc } = await setup({ localId: 'a', remoteId: 'z' });

    pc.onnegotiationneeded();
    pc.signalingState = RtcSignalingState.HaveLocalOffer;

    await onMessage({
      type: MessageType.SessionDescription,
      payload: { type: RtcDescriptionType.Offer },
    });

    expect(pc.setRemoteDescription).toHaveBeenCalled();
    expect(pc.setLocalDescription).toHaveBeenCalledTimes(2);
  });

  it('ignores offers while outside a stable state if impolite', async () => {
    const { onMessage, pc } = await setup({ localId: 'z', remoteId: 'a' });

    await pc.onnegotiationneeded();
    pc.signalingState = RtcSignalingState.HaveLocalOffer;

    await onMessage({
      type: MessageType.SessionDescription,
      payload: { type: RtcDescriptionType.Offer },
    });

    expect(pc.setRemoteDescription).not.toHaveBeenCalled();
    expect(pc.setLocalDescription).toHaveBeenCalledTimes(1);
  });

  // If we're the impolite peer and there was a call conflict, expect incoming
  // ICE candidates that are incompatible. Other parts of the protocol help
  // the other side figure it out and correct it remotely.
  it('swallows errors from remote candidates if expecting conflicts', async () => {
    const { onMessage, pc } = await setup({ localId: 'z', remoteId: 'a' });

    pc.onnegotiationneeded();
    pc.signalingState = RtcSignalingState.HaveLocalOffer;

    await onMessage({
      type: MessageType.SessionDescription,
      payload: { type: RtcDescriptionType.Offer },
    });

    pc.addIceCandidate.mockRejectedValue(new Error('testing call conflicts'));
    const promise = onMessage({
      type: MessageType.IceCandidate,
      payload: { mock: 'ice-candidate' },
    });

    await expect(promise).resolves.not.toThrow();
  });

  // "Politeness" only matters when dealing with call conflicts. Say we
  // started with a conflict, stabilized, then the connection degrates and ICE
  // needs to restart. We should allow the other side to make calls.
  it('resets conflict detectors after signaling stabilizes', async () => {
    const { onMessage, pc } = await setup({ localId: 'z', remoteId: 'a' });

    await pc.onnegotiationneeded();
    pc.signalingState = RtcSignalingState.Stable;

    await onMessage({
      type: MessageType.SessionDescription,
      payload: { type: RtcDescriptionType.Offer },
    });

    expect(pc.setLocalDescription).toHaveBeenCalledTimes(2);
  });

  it('closes the connection when instructed', async () => {
    const { mgr, signaler, pc } = await setup();
    jest.spyOn(signaler, 'close');

    mgr.close();

    expect(pc.close).toHaveBeenCalled();
    expect(signaler.close).toHaveBeenCalled();
    expect(mgr.messenger.close).toHaveBeenCalled();
  });

  describe('events', () => {
    it('notifies redux of the new track', async () => {
      const { pc, config } = await setup();
      const track = new MockMediaStreamTrack();

      await pc.ontrack({
        streams: [new MediaStream(), new MediaStream()],
        track,
      });

      expect(sdk.tracks.add).toHaveBeenCalledWith({
        peerId: config.remoteId,
        source: TrackSource.Device,
        track,
      });
    });

    it('identifies a stream association as being a screen share', async () => {
      const { pc, config } = await setup();
      const track = new MockMediaStreamTrack();

      await pc.ontrack({ streams: [new MediaStream()], track });

      expect(sdk.tracks.add).toHaveBeenCalledWith({
        peerId: config.remoteId,
        source: TrackSource.Display,
        track,
      });
    });

    it('marks the track removed when the stream is disassociated', async () => {
      const { pc, config } = await setup();
      const track = new MockMediaStreamTrack();

      const stream = new MediaStream();
      await pc.ontrack({ streams: [stream], track });

      const event = new MediaStreamTrackEvent('removetrack', { track });
      await stream.onremovetrack(event);

      expect(sdk.tracks.remove).toHaveBeenCalledWith({
        peerId: config.remoteId,
        trackId: track.id,
      });
    });
  });

  describe('addTrack', () => {
    it('adds a track to the peer connection', async () => {
      const { mgr, pc } = await setup();
      const track = new MockMediaStreamTrack();

      mgr.addTrack(track, TrackSource.Device);

      expect(pc.addTrack).toHaveBeenCalledWith(
        track,
        expect.any(MediaStream),
        expect.any(MediaStream),
      );
    });

    it('adds a stream association for display tracks', async () => {
      const { mgr, pc } = await setup();
      const track = new MockMediaStreamTrack();

      mgr.addTrack(track, TrackSource.Display);

      expect(pc.addTrack).toHaveBeenCalledWith(track, expect.any(MediaStream));
    });

    it('ignores duplicate tracks', async () => {
      const { mgr, pc } = await setup();

      const sender = new MockRTCRtpSender();
      sender.track = new MockMediaStreamTrack();

      pc.getSenders.mockReturnValue([sender]);
      mgr.addTrack(sender.track, TrackSource.Device);

      expect(pc.addTrack).not.toHaveBeenCalled();
    });
  });

  describe('removeTrack', () => {
    it('removes the track from the corresponding RTP sender', async () => {
      const { mgr, pc } = await setup();
      const track = new MockMediaStreamTrack();
      const sender = new MockRTCRtpSender();
      sender.replaceTrack(track);

      mgr.addTrack(track, TrackSource.Display);
      pc.getSenders.mockReturnValue([sender]);

      mgr.removeTrack(track);

      expect(pc.removeTrack).toHaveBeenCalledWith(sender);
    });

    it('ignores the request if the track is not already being sent', async () => {
      const { mgr, pc } = await setup();

      mgr.removeTrack(new MockMediaStreamTrack());

      expect(pc.removeTrack).not.toHaveBeenCalled();
    });
  });
});

describe('IceLogger', () => {
  // Bare minimum test coverage.
  it('survives the happy paths', () => {
    const pc = new MockRTCPeerConnection();
    IceLogger.observe(pc);
    const states: Array<RTCIceConnectionState> = [
      'checking',
      'closed',
      'completed',
      'connected',
      'disconnected',
      'failed',
      'new',
    ];

    states.forEach((state) => {
      pc.iceConnectionState = state;
      expect(() => pc.emit('iceconnectionstatechange')).not.toThrow();
    });
  });
});
