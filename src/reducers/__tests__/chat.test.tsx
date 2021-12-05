import { MY_PARTICIPANT_ID } from '../../utils/constants';
import setup from '../../testing/redux';
import * as chatEffects from '../../effects/chat';

jest.mock('../../effects/chat');

const mockedChatEffects: jest.Mocked<typeof chatEffects> = chatEffects as any;

describe('Chat reducer', () => {
  beforeEach(() => {
    mockedChatEffects.sendMessage.mockImplementation((outbound) => outbound);
  });

  describe('receiveMessage', () => {
    it('sets an unread message notice', () => {
      const { store, sdk } = setup();

      sdk.chat.receiveMessage({
        sentDate: new Date().toISOString(),
        author: MY_PARTICIPANT_ID,
        body: 'hi',
      });

      expect(store.getState().chat).toHaveProperty('unreadMessages', true);
    });
  });

  describe('sendMessage', () => {
    it('puts the message in redux', () => {
      const { store, sdk } = setup();

      const msg = {
        body: 'hi',
        author: MY_PARTICIPANT_ID,
        sentDate: new Date().toISOString(),
      };

      sdk.chat.sendMessage({
        remoteId: MY_PARTICIPANT_ID,
        msg,
      });

      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          chat: { history: [msg] },
        },
      });
    });
  });

  describe('receiveMessage', () => {
    it('puts the message in redux', () => {
      const { store, sdk } = setup();

      const msg = {
        body: 'hi',
        author: MY_PARTICIPANT_ID,
        sentDate: new Date().toISOString(),
      };

      sdk.chat.receiveMessage(msg);

      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          chat: { history: [msg] },
        },
      });
    });

    it('sorts the messages by sent date', () => {
      const { store, sdk } = setup();

      const first = {
        body: 'first',
        author: MY_PARTICIPANT_ID,
        sentDate: '2020-06-15',
      };

      const second = {
        body: 'second',
        author: MY_PARTICIPANT_ID,
        sentDate: '2020-09-20',
      };

      // Dispatch out of order.
      sdk.chat.receiveMessage(second);
      sdk.chat.receiveMessage(first);

      expect(store.getState().participants).toMatchObject({
        [MY_PARTICIPANT_ID]: {
          chat: { history: [first, second] },
        },
      });
    });
  });
});
