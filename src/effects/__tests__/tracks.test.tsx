import { produce } from 'immer';
import * as effects from '../tracks';
import ConnectionManager from '../../conferencing/webrtc';
import { Stream } from '../../testing/mocks/libp2p';
import Libp2pMessenger from '../../conferencing/libp2p-messenger';
import context from '../../conferencing/global-context';
import initialState from '../../reducers/initial-state';
import { MY_PARTICIPANT_ID, TrackKind } from '../../utils/constants';

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

          state.tracks[audioTrack.id] = {
            kind: TrackKind.Audio,
          };

          state.tracks[videoTrack.id] = {
            kind: TrackKind.Video,
          };
        }),
      };
    }

    it('sends all local tracks to the remote peer', () => {
      const { mgr, peerId, state, audioTrack, videoTrack } = setup();

      effects.sendLocalTracks(peerId, state);

      expect(mgr.addTrack).toHaveBeenCalledWith(audioTrack);
      expect(mgr.addTrack).toHaveBeenCalledWith(videoTrack);
    });
  });

  describe('add', () => {
    it('adds the new track', () => {
      const track = new MediaStreamTrack();
      const peerId = 'remote-peer';

      effects.add({ track, peerId });

      expect(context.tracks.get(track.id)).toBe(track);
    });

    it('returns track metadata', () => {
      const track = new MediaStreamTrack();
      const peerId = 'remote-peer';

      const result = effects.add({ track, peerId });

      expect(result).toEqual({
        peerId,
        track: {
          id: track.id,
          kind: track.kind,
        },
      });
    });
  });
});
