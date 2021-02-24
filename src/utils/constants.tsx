import { v4 as uuid } from 'uuid';

export const MY_PARTICIPANT_ID = uuid();

export enum TrackKind {
  Audio = 'audio',
  Video = 'video',
}
