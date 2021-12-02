import { produce } from 'immer';
import { FiMic, FiVideo, FiMicOff, FiVideoOff } from 'react-icons/fi';
import renderer from '../../../testing/renderer';
import { Controls, mapStateToProps } from '../controls';
import initialState, { State } from '../../../reducers/initial-state';
import {
  MY_PARTICIPANT_ID,
  TrackKind,
  TrackSource,
} from '../../../utils/constants';
import * as factories from '../../../testing/factories';

describe('Controls', () => {
  const setup = renderer(Controls, {
    getDefaultProps: () => ({
      togglePhonebook: jest.fn(),
      toggleSettings: jest.fn(),
      shareScreen: jest.fn(),
      stopSharingScreen: jest.fn(),
      toggleChat: jest.fn(),
      pauseTrack: jest.fn(),
      resumeTrack: jest.fn(),
      leaveCall: jest.fn(),
      supportsScreenSharing: true,
      sharingScreen: false,
      activeCall: 'remote-peer-id',
      micTrackId: 'a-id',
      camTrackId: 'v-id',
      micEnabled: true,
      camEnabled: true,
      unreadMessages: false,
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
    expect(props.pauseTrack).toHaveBeenCalledWith(props.camTrackId);

    output.setProps({ camEnabled: false });
    findByTestId('toggle-video').simulate('click');
    expect(props.resumeTrack).toHaveBeenCalledWith(props.camTrackId);
  });

  it('toggles the audio track when you click the button', () => {
    const { output, findByTestId, props } = setup();

    findByTestId('toggle-audio').simulate('click');
    expect(props.pauseTrack).toHaveBeenCalledWith(props.micTrackId);

    output.setProps({ micEnabled: false });
    findByTestId('toggle-audio').simulate('click');
    expect(props.resumeTrack).toHaveBeenCalledWith(props.micTrackId);
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

  it('disables the mic/camera buttons when their track is missing', () => {
    const { output, findByTestId } = setup();

    expect(findByTestId('toggle-video').prop('disabled')).toBe(false);
    expect(findByTestId('toggle-audio').prop('disabled')).toBe(false);

    output.setProps({ camTrackId: null, micTrackId: null });
    expect(findByTestId('toggle-video').prop('disabled')).toBe(true);
    expect(findByTestId('toggle-audio').prop('disabled')).toBe(true);
  });

  it('hides the chat toggle if no call is in progress', () => {
    const { findByTestId } = setup({ activeCall: null });

    expect(findByTestId('toggle-chat').exists()).toBe(false);
  });

  it('only shows the "leave call" button when a call is in progress', () => {
    const { findByTestId: active } = setup({ activeCall: 'p-id' });
    const { findByTestId: inactive } = setup({ activeCall: null });

    expect(active('leave-call').exists()).toBe(true);
    expect(inactive('leave-call').exists()).toBe(false);
  });

  it('leaves the call when you press the "leave call" button', () => {
    const { findByTestId, props } = setup();

    findByTestId('leave-call').simulate('click');

    expect(props.leaveCall).toHaveBeenCalledWith(props.activeCall);
  });

  it('ends the screen share if you press the button again', () => {
    const { output, findByTestId, props } = setup({ sharingScreen: false });

    findByTestId('toggle-screen-share').simulate('click');
    expect(props.shareScreen).toHaveBeenCalled();

    output.setProps({ sharingScreen: true });
    findByTestId('toggle-screen-share').simulate('click');
    expect(props.stopSharingScreen).toHaveBeenCalled();
  });

  it('hides the screen sharing button if your platform does not support it', () => {
    const { findByTestId } = setup({ supportsScreenSharing: false });

    expect(findByTestId('toggle-screen-share').exists()).toBe(false);
  });

  it('toggles the settings panel when you click the button', () => {
    const { findByTestId, props } = setup();

    findByTestId('toggle-settings').simulate('click');

    expect(props.toggleSettings).toHaveBeenCalled();
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
          'a-id': factories.Track({
            kind: TrackKind.Audio,
            source: TrackSource.Device,
          }),
          'v-id': factories.Track({
            kind: TrackKind.Video,
            source: TrackSource.Device,
          }),
        };

        state.participants[MY_PARTICIPANT_ID].trackIds = Object.keys(
          state.tracks,
        );
      });

      expect(props).toMatchInlineSnapshot(`
        Object {
          "activeCall": null,
          "camEnabled": true,
          "camTrackId": "v-id",
          "micEnabled": true,
          "micTrackId": "a-id",
          "sharingScreen": false,
          "unreadMessages": false,
        }
      `);
    });
  });
});
