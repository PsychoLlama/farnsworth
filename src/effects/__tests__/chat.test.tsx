import * as effects from '../../effects';
import { MY_PARTICIPANT_ID } from '../../utils/constants';
import ConnectionManager from '../../conferencing/webrtc';
import context from '../../conferencing/global-context';

jest.mock('../../conferencing/webrtc');

describe('Chat effects', () => {
  beforeEach(() => {
    context.connections.clear();
  });

  describe('sendMessage', () => {
    it('sends a message', () => {
      const conn = new ConnectionManager({} as any); // Mock: params are ignored.
      (conn as any).messenger = { sendEvent: jest.fn() };
      context.connections.set('remote-peer-id', conn);

      const msg = {
        author: MY_PARTICIPANT_ID,
        body: 'hi',
        sentDate: new Date().toISOString(),
      };

      effects.chat.sendMessage({ recipient: 'remote-peer-id', msg });

      expect(conn.messenger.sendEvent).toHaveBeenCalled();
    });
  });
});
