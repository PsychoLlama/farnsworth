// Never displayed to the user. Mainly used for logs.
export const APP_NAME = 'farnsworth';

export const MY_PARTICIPANT_ID = 'self';

// This decides the libp2p relay server. Make sure it exists in your `.env`
// file.
export const SERVER_ADDRESS = process.env.RELAY_SERVER_ADDRESS;

// Farnsworth can be compiled with custom ICE servers (STUN/TURN), which play
// a large role on whether your connection succeeds. To configure them, put
// this in your .env file:
//
//     ICE_SERVERS='stun:<url>;stun:<another-url>'
//
// That defines two STUN servers separated by semicolons. Most TURN servers
// require credentials. You can add those as comma split values:
//
//     ICE_SERVERS='turn:<url>,<credential-type>,<username>,<password>'
//
// To avoid revealing private TURN credentials, consider saving your auth
// details manually instead through the settings panel.
//
// See here for more details:
// https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer
export const ICE_SERVERS: Array<RTCIceServer> = (process.env.ICE_SERVERS ?? '')
  .split(';')
  .filter(Boolean)
  .map((tuple) => {
    const [url, credentialType, username, credential] = tuple.split(',');

    const server: RTCIceServer = {
      urls: url,
    };

    if (credentialType) {
      Object.assign(server, {
        credentialType,
        username,
        credential,
      });
    }

    return server;
  });

export enum TrackKind {
  Audio = 'audio',
  Video = 'video',
}

export enum TrackSource {
  /** A webcam or physical microphone. */
  Device = 'device',

  /** A shared screen or browser tab. */
  Display = 'display',
}

export enum RtcDescriptionType {
  Offer = 'offer',
  // ... incomplete ...
}

export enum RtcSignalingState {
  Stable = 'stable',
  HaveLocalOffer = 'have-local-offer',
  // ... incomplete ...
}

export enum ConnectionState {
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnected = 'disconnected',
  Failed = 'failed',
}

export enum Routes {
  /** Alone, no active call. */
  Home = '/',

  /** Actively calling another user. */
  Call = '/call/:peerId',
}

export enum EventType {
  /** Pause a media track. */
  Pause = 'pause',

  /** Resume a media track. */
  Resume = 'resume',

  /** Send a chat message. */
  ChatMessage = 'chat-message',
}
