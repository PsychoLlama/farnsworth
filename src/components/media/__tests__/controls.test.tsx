import { produce } from 'immer';
import { FiMic, FiVideo, FiMicOff, FiVideoOff } from 'react-icons/fi';
import renderer from '../../../testing/renderer';
import { Controls, mapStateToProps } from '../controls';
import initialState, { State } from '../../../reducers/initial-state';
import { MY_PARTICIPANT_ID, TrackKind } from '../../../utils/constants';

describe('Controls', () => {
  const setup = renderer(Controls, {
    getDefaultProps: () => ({
      togglePhonebook: jest.fn(),
      pauseTrack: jest.fn(),
      resumeTrack: jest.fn(),
      micTrackId: 'a-id',
      camTrackId: 'v-id',
      micEnabled: true,
      camEnabled: true,
    }),
  });

  it('opens the phonebook when the control is clicked', () => {
    const { findByTestId, props } = setup();

    findByTestId('toggle-phonebook').simulate('click');

    expect(props.togglePhonebook).toHaveBeenCalled();
  });

  it('toggles the video track when you click the button', () => {
    const { output, findByTestId, props } = setup();

    findByTestId('toggle-video').simulate('click');
    expect(props.pauseTrack).toHaveBeenCalledWith({
      trackId: props.camTrackId,
      kind: TrackKind.Video,
    });

    output.setProps({ camEnabled: false });
    findByTestId('toggle-video').simulate('click');
    expect(props.resumeTrack).toHaveBeenCalledWith({
      trackId: props.camTrackId,
      kind: TrackKind.Video,
    });
  });

  it('toggles the audio track when you click the button', () => {
    const { output, findByTestId, props } = setup();

    findByTestId('toggle-audio').simulate('click');
    expect(props.pauseTrack).toHaveBeenCalledWith({
      trackId: props.micTrackId,
      kind: TrackKind.Audio,
    });

    output.setProps({ micEnabled: false });
    findByTestId('toggle-audio').simulate('click');
    expect(props.resumeTrack).toHaveBeenCalledWith({
      trackId: props.micTrackId,
      kind: TrackKind.Audio,
    });
  });

  it('changes mic/camera styles based on whether the track is active', () => {
    const { output: active } = setup();
    const { output: inactive } = setup({
      micEnabled: false,
      camEnabled: false,
    });

    expect(inactive.find(FiVideoOff).exists()).toBe(true);
    expect(inactive.find(FiMicOff).exists()).toBe(true);

    expect(active.find(FiVideo).exists()).toBe(true);
    expect(active.find(FiMic).exists()).toBe(true);
  });

  describe('mapStateToProps', () => {
    function setup(patchState: (state: State) => void) {
      const state = produce(initialState, patchState);
      const props = mapStateToProps(state);

      return {
        props,
        state,
      };
    }

    it('returns the expected props', () => {
      const { props } = setup((state) => {
        state.tracks = {
          'a-id': { kind: TrackKind.Audio, enabled: true, local: true },
          'v-id': { kind: TrackKind.Video, enabled: true, local: true },
        };

        state.participants[MY_PARTICIPANT_ID].trackIds = Object.keys(
          state.tracks,
        );
      });

      expect(props).toMatchInlineSnapshot(`
        Object {
          "camEnabled": true,
          "camTrackId": "v-id",
          "micEnabled": true,
          "micTrackId": "a-id",
        }
      `);
    });
  });
});
