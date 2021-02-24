import { TrackKind, MY_PARTICIPANT_ID } from '../utils/constants';

/**
 * Note: Redux state doesn't contain complex objects like media streams or
 * WebRTC connections, but it does contain IDs pointing to those resources.
 *
 * See: ../conferencing/global-context
 */
export interface State {
  participants: {
    [participantId: string]: {
      isMe: boolean;
      trackIds: Array<string>;
    };
  };

  // Contains both local and foreign media track metadata, both audio and
  // video.
  tracks: {
    [trackId: string]: {
      kind: TrackKind;
    };
  };
}

const initialState: State = {
  participants: {
    [MY_PARTICIPANT_ID]: {
      isMe: true,
      trackIds: [],
    },
  },
  tracks: {},
};

export default initialState;
