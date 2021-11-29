import context from '../conferencing/global-context';
import { EventType } from '../utils/constants';

// Pause and resume events don't make much sense for screen sharing. It seems
// relatively safe (and simple) to send a track kind, in lou of an ID.
export function broadcastEvent(event: { type: EventType; payload: unknown }) {
  Array.from(context.connections.values()).forEach((conn) => {
    conn.messenger.sendEvent(event);
  });
}
