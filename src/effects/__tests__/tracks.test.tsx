import { produce } from 'immer';
import * as effects from '../tracks';
import ConnectionManager from '../../conferencing/webrtc';
import { Stream } from '../../testing/mocks/libp2p';
import Libp2pMessenger from '../../conferencing/libp2p-messenger';
import context from '../../conferencing/global-context';
import initialState from '../../reducers/initial-state';
import { TrackSource } from '../../utils/constants';
import * as factories from '../../testing/factories';

jest.mock('../../conferencing/webrtc');

describe('Track effects', () => {
  beforeEach(() => {
    context.connections.clear();
    context.tracks.clear();
  });

  describe('add', () => {
    it('adds the new track', () => {
      const track = new MediaStreamTrack();
      const peerId = 'remote-peer';

      effects.add({ track, peerId, source: TrackSource.Device });

      expect(context.tracks.get(track.id)).toBe(track);
    });

    it('returns track metadata', () => {
      const track = new MediaStreamTrack();
      const peerId = 'remote-peer';

      const result = effects.add({ track, peerId, source: TrackSource.Device });

      expect(result).toEqual({
        peerId,
        track: {
          id: track.id,
          kind: track.kind,
          enabled: track.enabled,
          source: TrackSource.Device,
        },
      });
    });
  });

  describe('pause', () => {
    it('disables the track', () => {
      const track = new MediaStreamTrack();
      context.tracks.set(track.id, track);

      expect(track.enabled).toBe(true);
      effects.pause(track.id);
      expect(track.enabled).toBe(false);
    });

    it('notifies the remote peer', () => {
      const track = new MediaStreamTrack();
      context.tracks.set(track.id, track);

      const mgr = new ConnectionManager({
        signaler: Libp2pMessenger.from(new Stream()),
        remoteId: 'a',
        localId: 'b',
        webrtcSettings: {},
      });

      (mgr as any).messenger = { sendEvent: jest.fn() };
      context.connections.set('mgr', mgr);

      effects.pause(track.id);
      expect(mgr.messenger.sendEvent).toHaveBeenCalledWith({
        type: 'pause',
        payload: { kind: track.kind },
      });
    });
  });

  describe('resume', () => {
    it('disables the track', () => {
      const track = new MediaStreamTrack();
      track.enabled = false;
      context.tracks.set(track.id, track);

      expect(track.enabled).toBe(false);
      effects.resume(track.id);
      expect(track.enabled).toBe(true);
    });

    it('notifies the remote peer', () => {
      const track = new MediaStreamTrack();
      context.tracks.set(track.id, track);

      const mgr = new ConnectionManager({
        signaler: Libp2pMessenger.from(new Stream()),
        remoteId: 'a',
        localId: 'b',
        webrtcSettings: {},
      });

      (mgr as any).messenger = { sendEvent: jest.fn() };
      context.connections.set('mgr', mgr);

      effects.resume(track.id);
      expect(mgr.messenger.sendEvent).toHaveBeenCalledWith({
        type: 'resume',
        payload: { kind: track.kind },
      });
    });
  });

  describe('toggle', () => {
    it('toggles the pause/play state', () => {
      const track = new MediaStreamTrack();
      context.tracks.set(track.id, track);

      track.enabled = true;
      effects.toggle(track.id);
      expect(track.enabled).toBe(false);
      effects.toggle(track.id);
      expect(track.enabled).toBe(true);
    });
  });

  describe('sendLocalTracks', () => {
    it('sends your local tracks to all participants', () => {
      const local = new MediaStreamTrack();
      const remote = new MediaStreamTrack();
      context.tracks.set(local.id, local);
      context.tracks.set(remote.id, remote);

      const mgr = new ConnectionManager({
        remoteId: 'peer-id',
        localId: 'a',
        signaler: Libp2pMessenger.from(new Stream()),
        webrtcSettings: {},
      });

      context.connections.set('peer-id', mgr);

      const state = produce(initialState, (state) => {
        state.tracks[remote.id] = factories.Track({ local: false });
        state.tracks[local.id] = factories.Track({
          local: true,
          source: TrackSource.Device,
        });
      });

      effects.sendLocalTracks(state);

      expect(mgr.addTrack).toHaveBeenCalledWith(local, TrackSource.Device);
      expect(mgr.addTrack).toHaveBeenCalledTimes(1);
    });
  });
});
