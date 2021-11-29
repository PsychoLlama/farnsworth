import { createAction } from 'retreon';
import * as effects from '../effects';
import { ChatMessage } from '../reducers/initial-state';

export const sendMessage = createAction(
  'chat/send-message',
  effects.chat.sendMessage,
);

export const receiveMessage = createAction<ChatMessage>('chat/receive-message');
export const open = createAction('chat/open');
export const close = createAction('chat/close');
export const toggle = createAction('chat/toggle');
