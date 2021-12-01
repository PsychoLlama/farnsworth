import {
  TrackKind,
  TrackSource,
  ConnectionState,
  MY_PARTICIPANT_ID,
} from '../utils/constants';
import { Route } from '../utils/router';

export interface ChatMessage {
  /** ISO 8601 */
  sentDate: string;
  /** Peer ID */
  author: string;
  /** Message body */
  body: string;
}

export enum PanelView {
  /** Panel is closed */
  None = 'none',
  /** Chat messages */
  Chat = 'chat',
  /** Device management and advanced settings */
  Settings = 'settings',
}

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

  call: null | {
    peerId: string;
  };

  participants: {
    [participantId: string]: {
      isMe: boolean;
      trackIds: Array<string>;
      connection: {
        state: ConnectionState;
      };
      chat: {
        /**
         * The entire message history. Note, this may grow to an untenable
         * level. It should be paginated in the future.
         */
        history: Array<ChatMessage>;
      };
    };
  };

  // Contains both local and foreign media track metadata, both audio and
  // video.
  tracks: {
    [trackId: string]: {
      source: TrackSource;
      kind: TrackKind;
      enabled: boolean;
      local: boolean;
    };
  };

  // Manages calling and frequent contacts.
  phonebook: { open: boolean };

  // Manages the chat panel.
  chat: { unreadMessages: boolean };

  // Manages the sidebar panel.
  panel: { view: PanelView };
}

const initialState: State = {
  route: {
    id: '/',
    pathName: '/',
    params: {},
  },
  relay: null,
  call: null,
  participants: {
    [MY_PARTICIPANT_ID]: {
      isMe: true,
      trackIds: [],
      connection: {
        state: ConnectionState.Connected,
      },
      chat: {
        history: [],
      },
    },
  },
  tracks: {},
  phonebook: { open: false },
  chat: { unreadMessages: false },
  panel: { view: PanelView.None },
};

export default initialState;
