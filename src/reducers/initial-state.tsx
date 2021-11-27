import {
  TrackKind,
  ConnectionState,
  MY_PARTICIPANT_ID,
} from '../utils/constants';
import { Route } from '../utils/router';

/**
 * Note: Redux state doesn't contain complex objects like media streams or
 * WebRTC connections, but it does contain IDs pointing to those resources.
 *
 * See: ../conferencing/global-context
 */
export interface State {
  route: Route;

  relay: null | {
    /**
     * References the libp2p peer ID. These IDs are used to distinguish
     * different users, including yourself. Your own participant object is
     * indexed by `state.localId`.
     *
     * The value is added asynchronously because generating IDs depends on
     * computationally intensive cryptographic APIs.
     */
    localId: string;

    // The current relay server's multiaddr.
    server: string;
  };

  participants: {
    [participantId: string]: {
      isMe: boolean;
      trackIds: Array<string>;
      connection: {
        state: ConnectionState;
      };
    };
  };

  // Contains both local and foreign media track metadata, both audio and
  // video.
  tracks: {
    [trackId: string]: {
      kind: TrackKind;
      enabled: boolean;
      local: boolean;
    };
  };

  // Manages calling and frequent contacts.
  phonebook: {
    open: boolean;
  };
}

const initialState: State = {
  route: {
    id: '/',
    pathName: '/',
    params: {},
  },
  relay: null,
  participants: {
    [MY_PARTICIPANT_ID]: {
      isMe: true,
      trackIds: [],
      connection: {
        state: ConnectionState.Connected,
      },
    },
  },
  tracks: {},
  phonebook: {
    open: false,
  },
};

export default initialState;
