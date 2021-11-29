import { ChatMessage } from '../reducers/initial-state';
import { EventType } from '../utils/constants';
import { getConnectionById } from './connections';

/**
 * Sends a chat message to the other participant.
 */
export function sendMessage(envelope: { remoteId: string; msg: ChatMessage }) {
  const conn = getConnectionById(envelope.remoteId);
  conn.messenger.sendEvent({
    type: EventType.ChatMessage,
    payload: envelope.msg,
  });

  return envelope;
}
