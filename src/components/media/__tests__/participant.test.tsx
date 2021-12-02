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
import * as factories from '../../../testing/factories';

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
        state.tracks['a-id'] = factories.Track({
          kind: TrackKind.Audio,
          source: TrackSource.Device,
        });

        state.tracks['v-id'] = factories.Track({
          kind: TrackKind.Video,
          source: TrackSource.Device,
        });
      });

      expect(props).toMatchObject({
        audioTrackId: 'a-id',
        videoTrackId: 'v-id',
      });
    });

    it('filters by tracks of its own kind', () => {
      const state = produce(initialState, (state) => {
        state.participants[MY_PARTICIPANT_ID].trackIds = ['dev-id', 'dis-id'];
        state.tracks = {
          'dev-id': factories.Track({
            source: TrackSource.Device,
            kind: TrackKind.Video,
          }),
          'dis-id': factories.Track({
            source: TrackSource.Display,
            kind: TrackKind.Video,
          }),
        };
      });

      const props = mapStateToProps(state, {
        id: MY_PARTICIPANT_ID,
        sourceType: TrackSource.Display,
      });

      expect(props.videoTrackId).toBe('dis-id');
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
