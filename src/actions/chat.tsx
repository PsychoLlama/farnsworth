import { createAction } from 'retreon';
import * as effects from '../effects';

export const sendMessage = createAction(
  'chat/send-message',
  effects.chat.sendMessage,
);
