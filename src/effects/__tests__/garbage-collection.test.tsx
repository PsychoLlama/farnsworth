import produce from 'immer';
import initialState from '../../reducers/initial-state';
import context from '../../conferencing/global-context';
import * as effects from '../';
import { TrackKind, TrackSource } from '../../utils/constants';
import ConnectionManager from '../../conferencing/webrtc';

jest.mock('../../conferencing/webrtc');

describe('Garbage collection effects', () => {
  beforeEach(() => {
    context.connections.clear();
    context.tracks.clear();
  });

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
          source: TrackSource.Device,
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

  describe('discardUnusedConnections', () => {
    it('deletes connections not referenced in redux', () => {
      const conn = new ConnectionManager({} as any);
      context.connections.set('remote-peer', conn);

      // Initial state only has your own object. Discard everything else.
      effects.gc.discardUnusedConnections(initialState);

      expect(conn.close).toHaveBeenCalled();
      expect(context.connections.size).toBe(0);
    });

    it('does not remove referenced connections', () => {
      const conn = new ConnectionManager({} as any);
      context.connections.set('remote-peer', conn);

      // Initial state only has your own object. Discard everything else.
      const state = produce(initialState, (state) => {
        state.participants['remote-peer'] = {} as any; // Props don't matter.
      });

      effects.gc.discardUnusedConnections(state);

      expect(conn.close).not.toHaveBeenCalled();
      expect(context.connections.size).toBe(1);
    });
  });
});
