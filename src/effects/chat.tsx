import assert from 'assert';
import { ChatMessage } from '../reducers/initial-state';
import context from '../conferencing/global-context';
import { EventType } from '../utils/constants';

function getConnectionById(peerId: string) {
  const conn = context.connections.get(peerId);
  assert(conn, `No such connection (id="${peerId}")`);

  return conn;
}

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
