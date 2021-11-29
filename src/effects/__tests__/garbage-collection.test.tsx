import produce from 'immer';
import initialState from '../../reducers/initial-state';
import context from '../../conferencing/global-context';
import * as effects from '../';
import { TrackKind } from '../../utils/constants';

describe('Garbage collection effects', () => {
  describe('discardUnusedTracks', () => {
    it('deletes tracks not referenced in redux', () => {
      const track = new MediaStreamTrack();
      context.tracks.set(track.id, track);

      // Clean state: no referenced tracks, so delete everything.
      effects.gc.discardUnusedTracks(initialState);

      expect(track.stop).toHaveBeenCalled();
      expect(context.tracks.size).toBe(0);
    });

    it('does not remove referenced tracks', () => {
      const track = new MediaStreamTrack();
      context.tracks.set(track.id, track);

      const state = produce(initialState, (state) => {
        state.tracks[track.id] = {
          kind: track.kind as TrackKind,
          enabled: track.enabled,
          local: false,
        };
      });

      // All tracks are referenced. Don't discard anything.
      effects.gc.discardUnusedTracks(state);

      expect(track.stop).not.toHaveBeenCalled();
      expect(context.tracks.size).toBe(1);
    });
  });
});
