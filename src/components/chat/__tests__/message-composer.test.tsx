import produce from 'immer';
import renderer from '../../../testing/renderer';
import { MessageComposer, mapStateToProps } from '../message-composer';
import initialState, { State } from '../../../reducers/initial-state';
import { ConnectionState } from '../../../utils/constants';
import * as factories from '../../../testing/factories';

jest.useFakeTimers('modern');
jest.setSystemTime(new Date('2000-06-15Z'));

describe('MessageComposer', () => {
  const setup = renderer(MessageComposer, {
    getDefaultProps: () => ({
      sendMessage: jest.fn(),
      remoteId: 'remote-peer-id',
      localId: 'local-peer-id',
      connectionState: ConnectionState.Connected,
    }),
  });

  it('autosizes the input when content changes', () => {
    const { findByTestId } = setup();

    const event = { currentTarget: { style: {}, scrollHeight: 40 } };
    findByTestId('chat-message-composer').simulate('input', event);

    expect(event.currentTarget.style).toMatchObject({
      height: expect.stringContaining('40px'),
    });
  });

  it('sends the message when you press enter', () => {
    const { findByTestId, props } = setup();

    const event = {
      key: 'Enter',
      shiftKey: false,
      preventDefault: jest.fn(),
    };

    const input = { currentTarget: { style: {}, value: 'hi' } };
    findByTestId('chat-message-composer').simulate('input', input);
    findByTestId('chat-message-composer').simulate('keyDown', event);
    expect(findByTestId('chat-message-composer').prop('value')).toBe('');

    expect(props.sendMessage).toHaveBeenCalledWith({
      remoteId: props.remoteId,
      msg: {
        sentDate: '2000-06-15T00:00:00.000Z',
        author: props.localId,
        body: 'hi',
      },
    });
  });

  it('does not send the message if you hold Shift+Enter', () => {
    const { findByTestId, props } = setup();

    const event = {
      key: 'Enter',
      shiftKey: true,
      preventDefault: jest.fn(),
    };

    findByTestId('chat-message-composer').simulate('keyDown', event);

    expect(props.sendMessage).not.toHaveBeenCalled();
  });

  it('does not send messages with nothing but whitespace', () => {
    const { findByTestId, props } = setup();

    const event = {
      key: 'Enter',
      shiftKey: false,
      preventDefault: jest.fn(),
    };

    const input = { currentTarget: { style: {}, value: '\n\t ' } };
    findByTestId('chat-message-composer').simulate('input', input);
    findByTestId('chat-message-composer').simulate('keyDown', event);

    expect(props.sendMessage).not.toHaveBeenCalled();
  });

  it('disables the input while disconnected', () => {
    const { findByTestId } = setup({
      connectionState: ConnectionState.Disconnected,
    });

    expect(findByTestId('chat-message-composer').prop('disabled')).toBe(true);
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
      const { props, state } = setup((state) => {
        state.call = { peerId: 'remote-peer-id' };
        state.participants['remote-peer-id'] = factories.Participant();
        state.relay = {
          server: '/server/maddr',
          localId: 'local-peer-id',
        };
      });

      expect(props).toEqual({
        remoteId: state.call.peerId,
        localId: state.relay.localId,
        connectionState: ConnectionState.Connected,
      });
    });
  });
});
