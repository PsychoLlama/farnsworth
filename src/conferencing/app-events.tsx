import { TrackKind, EventType } from '../utils/constants';
import { Message } from './webrtc/data-channel-messenger';
import { ChatMessage } from '../reducers/initial-state';

export default class AppEvents {
  private remoteId: string;

  constructor(config: { remoteId: string }) {
    this.remoteId = config.remoteId;
  }

  async handleEvent(event: AppEvent) {
    const { default: sdk } = await import('../utils/sdk');

    switch (event.type) {
      case EventType.Pause:
        return sdk.tracks.markPaused(event.payload.kind);
      case EventType.Resume:
        return sdk.tracks.markResumed(event.payload.kind);
      case EventType.ChatMessage:
        return sdk.chat.receiveMessage({
          ...event.payload,
          // Prevent senders from forging author IDs.
          author: this.remoteId,
        });
    }
  }
}

interface TrackToggleEvent extends Message {
  type: EventType.Pause | EventType.Resume;
  payload: {
    kind: TrackKind;
  };
}

interface ChatMessageEvent extends Message {
  type: EventType.ChatMessage;
  payload: ChatMessage;
}

export type AppEvent = TrackToggleEvent | ChatMessageEvent;
