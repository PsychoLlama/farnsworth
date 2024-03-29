import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import assert from '../../utils/assert';
import * as css from '../../utils/css';
import * as actions from '../../actions';
import { State as ReduxState } from '../../reducers/initial-state';
import { ConnectionState } from '../../utils/constants';

/**
 * This supports a cheap implementation of an autosized multiline input
 * element. These constants provide an exact value for a line-based
 * `max-height` clamp.
 */
const BORDER_WIDTH = '1px';
const INPUT_PADDING = '0.5rem';
const FONT_SIZE = '14px';
const LINE_HEIGHT = '1.2';

// This is completely arbitrary.
const MAX_MESSAGE_SIZE = 2000;

export class MessageComposer extends React.Component<Props, State> {
  state = { message: '' };

  render() {
    const { connectionState } = this.props;
    const disconnected = connectionState !== ConnectionState.Connected;

    return (
      <Container>
        <Input
          data-test="chat-message-composer"
          placeholder={disconnected ? 'Disconnected' : 'Type a message'}
          onInput={this.autosize}
          onKeyDown={this.maybeSendMessage}
          value={this.state.message}
          rows={1}
          maxLength={MAX_MESSAGE_SIZE}
          autoFocus
          spellCheck
          autoComplete="off"
          disabled={disconnected}
        />
      </Container>
    );
  }

  autosize = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ref = event.currentTarget;
    ref.style.height = 'auto'; // Handles resizing when lines are deleted.
    ref.style.height = `calc(${ref.scrollHeight}px + ${BORDER_WIDTH} * 2)`;

    this.setState({ message: event.currentTarget.value });
  };

  maybeSendMessage = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { localId, remoteId } = this.props;
    const { message } = this.state;

    if (event.key !== 'Enter' || event.shiftKey === true) {
      return;
    }

    // The message is pure whitespace.
    if (/^\s*$/.test(message)) {
      return;
    }

    // Don't input a newline.
    event.preventDefault();

    // Clear the input.
    this.setState({ message: '' });

    this.props.sendMessage({
      remoteId,
      msg: {
        author: localId,
        sentDate: new Date().toISOString(),
        body: message,
      },
    });
  };
}

interface Props {
  sendMessage: typeof actions.chat.sendMessage;
  remoteId: string; // The remote peer ID.
  localId: string; // The local peer ID.
  connectionState: ConnectionState;
}

interface State {
  message: string;
}

const Container = styled.div`
  padding: 0.5rem;
`;

const Input = styled.textarea`
  background-color: ${css.color('background')};
  color: ${css.color('text')};
  border: ${BORDER_WIDTH} solid ${css.color('foreground')};
  border-radius: ${css.radius};
  margin: 0;
  resize: none;
  width: 100%;
  box-sizing: border-box;

  font-family: inherit;
  font-size: ${FONT_SIZE};
  line-height: ${LINE_HEIGHT};
  padding: ${INPUT_PADDING};

  // Max out at 5 lines of input, then scroll.
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(
    ${BORDER_WIDTH} * 2 + ${INPUT_PADDING} * 2 + ${FONT_SIZE} * ${LINE_HEIGHT} *
      5
  );

  :hover:not(:disabled),
  :focus:not(:disabled) {
    outline: none;
    border-color: ${css.color('primary')};
  }

  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: ${css.color('white')};

    ::placeholder {
      font-style: italic;
    }
  }
`;

export function mapStateToProps({ relay, call, participants }: ReduxState) {
  assert(relay, 'Missing local peer ID.');
  assert(call, 'We are not in a call.');

  return {
    localId: relay.localId,
    remoteId: call.peerId,
    connectionState: participants[call.peerId].connection.state,
  };
}

const mapDispatchToProps = {
  sendMessage: actions.chat.sendMessage,
};

export default connect(mapStateToProps, mapDispatchToProps)(MessageComposer);
