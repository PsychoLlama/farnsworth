import { v4 as uuid } from 'uuid';

export const MY_PARTICIPANT_ID = uuid();

// This decides the libp2p relay server. Make sure it exists in your `.env`
// file.
export const SERVER_ADDRESS = process.env.RELAY_SERVER_ADDRESS;

export enum TrackKind {
  Audio = 'audio',
  Video = 'video',
}
