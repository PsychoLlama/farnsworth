import { createAction } from 'retreon';
import * as effects from '../effects';
import { ChatMessage } from '../reducers/initial-state';

export const sendMessage = createAction(
  'chat/send-message',
  effects.chat.sendMessage,
);

export const receiveMessage = createAction<ChatMessage>('chat/receive-message');
