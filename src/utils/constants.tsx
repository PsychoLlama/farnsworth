import { v4 as uuid } from 'uuid';

// Never displayed to the user. Mainly used for logs.
export const APP_NAME = 'farnsworth';

export const MY_PARTICIPANT_ID = uuid();

// This decides the libp2p relay server. Make sure it exists in your `.env`
// file.
export const SERVER_ADDRESS = process.env.RELAY_SERVER_ADDRESS;

// A semicolon delimited list of STUN servers to use during signaling.
export const STUN_SERVERS = (process.env.STUN_SERVERS ?? '')
  .split(';')
  .filter(Boolean);

// IndexedDB key storing the libp2p peer pub/priv key pair.
export const STORAGE_KEY_PEER_ID = 'farnsworth/peer-id';

export enum TrackKind {
  Audio = 'audio',
  Video = 'video',
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
