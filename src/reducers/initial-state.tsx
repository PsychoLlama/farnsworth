import { DeviceInfo, DeviceChange } from 'media-devices';
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

export interface Settings {
  /** Only offer ICE candidates using our configured TURN relays. */
  forceTurnRelay: boolean;

  /** Whether to use the application's default ICE servers. */
  useDefaultIceServers: boolean;

  /** A list of custom user-defined TURN/STUN servers. */
  iceServers: Array<RTCIceServer>;
}

/**
 * Note: Redux state doesn't contain complex objects like media streams or
 * WebRTC connections, but it does contain IDs pointing to those resources.
 *
 * See: ../conferencing/global-context
 */
export interface State {
  /** The current browser URL. */
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

    /** The current relay server's multiaddr. */
    server: string;
  };

  /**
   * Indicates if you're in a call with someone else, even while temporarily
   * disconnected.
   */
  call: null | {
    peerId: string;
  };

  /**
   * Contains information about every participant in a call, both local and
   * remote.
   */
  participants: {
    [participantId: string]: {
      isMe: boolean;

      /** All the tracks owned by this participant. */
      trackIds: Array<string>;

      /** Contains metadata about our network connection with this participant. */
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

  /** Contains metadata about every media track, both local and remote. */
  tracks: {
    [trackId: string]: {
      /** Audio vs video. */
      kind: TrackKind;

      /** The type of content this track provides (e.g. camera vs screen). */
      source: TrackSource;

      /** Whether this is "paused", which has different meanings in WebRTC. */
      enabled: boolean;

      /** 'true' if the track was created by us. */
      local: boolean;

      /**
       * The device this track originates from. Null for remote or display
       * tracks.
       */
      deviceId: null | string;

      /**
       * The hardware group this track originates from. Null for remote or
       * display tracks.
       */
      groupId: null | string;

      /**
       * Generally only defined on mobile devices. Indicates which way the
       * camera is pointing.
       */
      facingMode: null | VideoFacingModeEnum;
    };
  };

  /** Manages the set of available audio/video devices. */
  sources: {
    /** A list of ways the device list changed since the last query. */
    changes: Array<DeviceChange>;

    /** All (known) A/V sources supported by this browser. */
    available: {
      audio: Array<DeviceInfo>;
      video: Array<DeviceInfo>;
    };
  };

  /** Manages calling features, like frequent contacts and invite URLs. */
  phonebook: { open: boolean };

  /** Manages global chat state. */
  chat: { unreadMessages: boolean };

  settings: Settings;

  /** Manages the state of the sidebar/panel UI. */
  panel: {
    lastView: PanelView;
    view: PanelView;
  };
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
  sources: {
    changes: [],
    available: {
      audio: [],
      video: [],
    },
  },
  phonebook: { open: false },
  chat: { unreadMessages: false },
  settings: {
    forceTurnRelay: false,
    useDefaultIceServers: true,
    iceServers: [],
  },
  panel: {
    lastView: PanelView.Chat,
    view: PanelView.None,
  },
};

export default initialState;
