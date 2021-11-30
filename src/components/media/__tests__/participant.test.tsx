import { produce } from 'immer';
import renderer from '../../../testing/renderer';
import { Participant, mapStateToProps } from '../participant';
import {
  MY_PARTICIPANT_ID,
  TrackKind,
  TrackSource,
  ConnectionState,
} from '../../../utils/constants';
import initialState, { State } from '../../../reducers/initial-state';
import MediaView from '../media-view';

describe('Participant', () => {
  const setup = renderer(Participant, {
    getDefaultProps: () => ({
      id: MY_PARTICIPANT_ID,
      audioTrackId: null,
      videoTrackId: null,
      connectionState: ConnectionState.Connected,
    }),
  });

  it('renders a media view', () => {
    const { output, props } = setup({
      audioTrackId: 'audio-id',
      videoTrackId: 'video-id',
    });

    expect(output.find(MediaView).props()).toMatchObject({
      audioTrackId: props.audioTrackId,
      videoTrackId: props.videoTrackId,
    });
  });

  it('indicates if the media stream is your own', () => {
    const { output: me } = setup({ id: MY_PARTICIPANT_ID });
    const { output: other } = setup({ id: 'other-participant' });

    expect(me.find(MediaView).prop('isLocal')).toBe(true);
    expect(other.find(MediaView).prop('isLocal')).toBe(false);
  });

  describe('mapStateToProps', () => {
    function setup(patchState: (state: State) => void) {
      const state = produce(initialState, patchState);

      return {
        state,
        props: mapStateToProps(state, {
          id: MY_PARTICIPANT_ID,
        }),
      };
    }

    it('grabs the participant A/V tracks', () => {
      const { props } = setup((state) => {
        state.participants[MY_PARTICIPANT_ID].trackIds = ['a-id', 'v-id'];
        state.tracks['a-id'] = {
          kind: TrackKind.Audio,
          source: TrackSource.Device,
          enabled: true,
          local: true,
        };

        state.tracks['v-id'] = {
          kind: TrackKind.Video,
          source: TrackSource.Device,
          enabled: true,
          local: true,
        };
      });

      expect(props).toMatchObject({
        audioTrackId: 'a-id',
        videoTrackId: 'v-id',
      });
    });

    it('grabs the participant connection state', () => {
      const { props } = setup((state) => {
        state.participants[MY_PARTICIPANT_ID].connection.state =
          ConnectionState.Connecting;
      });

      expect(props).toMatchObject({
        connectionState: ConnectionState.Connecting,
      });
    });

    it('survives when no IDs are present', () => {
      const { props } = setup((state) => state);

      expect(props).toMatchObject({
        audioTrackId: null,
        videoTrackId: null,
      });
    });
  });
});
