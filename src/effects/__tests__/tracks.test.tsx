import { produce } from 'immer';
import * as effects from '../tracks';
import ConnectionManager from '../../conferencing/webrtc';
import { Stream } from '../../testing/mocks/libp2p';
import Libp2pMessenger from '../../conferencing/libp2p-messenger';
import context from '../../conferencing/global-context';
import initialState from '../../reducers/initial-state';
import {
  MY_PARTICIPANT_ID,
  TrackKind,
  TrackSource,
} from '../../utils/constants';
import * as factories from '../../testing/factories';

jest.mock('../../conferencing/webrtc');

describe('Track effects', () => {
  beforeEach(() => {
    context.connections.clear();
    context.tracks.clear();
  });

  describe('sendLocalTracks', () => {
    function setup() {
      const peerId = 'peer-id';

      const mgr = new ConnectionManager({
        remoteId: peerId,
        localId: 'a',
        signaler: Libp2pMessenger.from(new Stream()),
        webrtcSettings: {},
      });

      context.connections.set(peerId, mgr);

      const audioTrack = new MediaStreamTrack();
      const videoTrack = new MediaStreamTrack();
      context.tracks.set(audioTrack.id, audioTrack);
      context.tracks.set(videoTrack.id, videoTrack);

      return {
        mgr: mgr as jest.Mocked<typeof mgr>,
        peerId,
        audioTrack,
        videoTrack,
        state: produce(initialState, (state) => {
          state.participants[MY_PARTICIPANT_ID].trackIds.push(
            audioTrack.id,
            videoTrack.id,
          );

          state.tracks[audioTrack.id] = factories.Track({
            kind: TrackKind.Audio,
            source: TrackSource.Device,
          });

          state.tracks[videoTrack.id] = factories.Track({
            kind: TrackKind.Video,
            source: TrackSource.Display,
          });
        }),
      };
    }

    it('sends all local tracks to the remote peer', () => {
      const { mgr, peerId, state, audioTrack, videoTrack } = setup();

      effects.sendLocalTracks(peerId, state);

      expect(mgr.addTrack).toHaveBeenCalledWith(audioTrack, TrackSource.Device);
      expect(mgr.addTrack).toHaveBeenCalledWith(
        videoTrack,
        TrackSource.Display,
      );
    });
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
});
