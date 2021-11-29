import produce from 'immer';
import React from 'react';
import renderer from '../../testing/renderer';
import { KeyboardObserver, mapStateToProps } from '../keyboard-observer';
import initialState, { State } from '../../reducers/initial-state';
import { TrackKind } from '../../utils/constants';

describe('KeyboardObserver', () => {
  const setup = renderer(KeyboardObserver, {
    getDefaultProps: () => ({
      toggleTrack: jest.fn(),
      audioTrackId: 'a-id',
      videoTrackId: 'v-id',
    }),
  });

  it('renders the children', () => {
    const Noop = () => null;

    const { output } = setup({
      children: <Noop />,
    });

    expect(output.find(Noop).exists()).toBe(true);
  });

  it('toggles the video track on a predetermined keybinding', () => {
    const { props } = setup();

    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'e' });
    document.body.dispatchEvent(event);

    expect(props.toggleTrack).toHaveBeenCalledWith({
      trackId: props.videoTrackId,
      kind: TrackKind.Video,
    });
  });

  it('toggles the audio track on a predetermined keybinding', () => {
    const { props } = setup();

    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'd' });
    document.body.dispatchEvent(event);

    expect(props.toggleTrack).toHaveBeenCalledWith({
      trackId: props.audioTrackId,
      kind: TrackKind.Audio,
    });
  });

  it('has no effect if there are no audio or video tracks', () => {
    const { props } = setup({
      audioTrackId: null,
      videoTrackId: null,
    });

    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { ctrlKey: true, key: 'd' }),
    );

    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { ctrlKey: true, key: 'e' }),
    );

    expect(props.toggleTrack).not.toHaveBeenCalled();
  });

  describe('mapStateToProps', () => {
    function setup(patch: (state: State) => State | void) {
      const state = produce(initialState, patch);
      const props = mapStateToProps(state);

      return {
        state,
        props,
      };
    }

    it('grabs the correct state', () => {
      const { props } = setup(() => undefined);

      expect(props).toMatchInlineSnapshot(`
        Object {
          "audioTrackId": null,
          "videoTrackId": null,
        }
      `);
    });
  });
});
