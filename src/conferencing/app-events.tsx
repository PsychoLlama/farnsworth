import { TrackKind } from '../utils/constants';
import { Message } from './webrtc/data-channel-messenger';

export default class AppEvents {
  async handleEvent(event: AppEvent) {
    const { default: sdk } = await import('../utils/sdk');

    switch (event.type) {
      case 'pause':
        return sdk.tracks.markPaused(event.payload.kind);
      case 'resume':
        return sdk.tracks.markResumed(event.payload.kind);
    }
  }
}

interface TrackToggleEvent extends Message {
  type: 'pause' | 'resume';
  payload: {
    kind: TrackKind;
  };
}

export type AppEvent = TrackToggleEvent;
