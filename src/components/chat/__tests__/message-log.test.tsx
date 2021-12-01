import produce from 'immer';
import renderer from '../../../testing/renderer';
import { MessageLog, mapStateToProps } from '../message-log';
import initialState, {
  State,
  ChatMessage,
} from '../../../reducers/initial-state';
import { ConnectionState } from '../../../utils/constants';

describe('MessageLog', () => {
  function createMsg(patch?: Partial<ChatMessage>): ChatMessage {
    return {
      author: 'local-peer-id',
      sentDate: '2000-06-15T00:00:00.000Z',
      body: 'Hello, world',
      ...patch,
    };
  }

  const setup = renderer(MessageLog, {
    getDefaultProps: () => ({
      localId: 'local-peer-id',
      messages: [createMsg(), createMsg()],
    }),
  });

  it('shows all the messages', () => {
    const { findByTestId, props } = setup();

    expect(findByTestId('chat-message').length).toBe(props.messages.length);
  });

  it('shows the message time', () => {
    const { findByTestId, props } = setup({
      messages: [createMsg()],
    });

    expect(findByTestId('chat-message-timestamp').prop('dateTime')).toBe(
      props.messages[0].sentDate,
    );
  });

  it('distinguishes local messages from remote messages', () => {
    const { findByTestId } = setup({
      localId: 'local-id',
      messages: [
        createMsg({ author: 'local-id' }),
        createMsg({ author: 'remote-id' }),
      ],
    });

    expect(findByTestId('chat-message').at(0).prop('data-local')).toBe(true);
    expect(findByTestId('chat-message').at(1).prop('data-local')).toBe(false);
  });

  it('scrolls into view on a new message', () => {
    const { output, findByTestId } = setup({ messages: [] });

    const anchor = findByTestId('scroll-anchor').getElement();
    const ref = { scrollIntoView: jest.fn() };
    (anchor as any).ref(ref);

    expect(ref.scrollIntoView).toHaveBeenCalledTimes(1);
    output.setProps({ messages: [createMsg()] });
    expect(ref.scrollIntoView).toHaveBeenCalledTimes(2);
  });

  describe('mapStateToProps', () => {
    function setup(patch: (state: State) => void | State) {
      const state = produce(initialState, patch);
      const props = mapStateToProps(state);

      return {
        state,
        props,
      };
    }

    it('grabs the necessary state', () => {
      const { state, props } = setup((state) => {
        state.relay = { server: '/server/maddr', localId: 'local-id' };
        state.call = { peerId: 'remote-peer' };
        state.participants['remote-peer'] = {
          isMe: false,
          trackIds: [],
          connection: { state: ConnectionState.Connected },
          chat: { history: [] },
        };
      });

      expect(props).toMatchObject({
        messages: state.participants['remote-peer'].chat.history,
        localId: state.relay.localId,
      });
    });
  });
});
