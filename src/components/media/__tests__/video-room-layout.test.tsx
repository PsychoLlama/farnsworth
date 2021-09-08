import { produce } from 'immer';
import renderer from '../../../testing/renderer';
import { VideoRoomLayout, mapStateToProps } from '../video-room-layout';
import initialState, { State } from '../../../reducers/initial-state';
import { MY_PARTICIPANT_ID } from '../../../utils/constants';
import Participant from '../participant';

describe('VideoRoomLayout', () => {
  const setup = renderer(VideoRoomLayout, {
    getDefaultProps: () => ({
      participantIds: [MY_PARTICIPANT_ID],
    }),
  });

  it('renders', () => {
    expect(setup).not.toThrow();
  });

  it('switches video layouts when more than one person is in the room', () => {
    const { output: one } = setup();
    const { output: two } = setup({
      participantIds: [MY_PARTICIPANT_ID, 'other-peer'],
    });

    expect(one.find(Participant).length).toBe(1);
    expect(two.find(Participant).length).toBe(2);
  });

  describe('mapStateToProps', () => {
    function setup(patchState: (state: State) => void) {
      const state = produce(initialState, patchState);

      return {
        state,
        props: mapStateToProps(state),
      };
    }

    it('returns the correct props', () => {
      const { props } = setup(() => initialState);

      expect(props).toEqual({
        participantIds: [MY_PARTICIPANT_ID],
      });
    });
  });
});
