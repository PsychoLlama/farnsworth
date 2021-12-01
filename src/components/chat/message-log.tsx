import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import assert from '../../utils/assert';
import { State, ChatMessage } from '../../reducers/initial-state';
import * as css from '../../utils/css';

export class MessageLog extends React.Component<Props> {
  scrollTarget: null | HTMLSpanElement = null;

  componentDidUpdate({ messages }: Props) {
    if (messages.length < this.props.messages.length) {
      this.scrollTarget.scrollIntoView({ behavior: 'smooth' });
    }
  }

  render() {
    return (
      <Container aria-atomic aria-live="polite">
        {this.props.messages.map(this.renderMessage)}
        <span data-test="scroll-anchor" ref={this.setScrollTarget} />
      </Container>
    );
  }

  renderMessage = (message: ChatMessage) => {
    const locales = navigator.languages.slice();
    const formatter = new Intl.DateTimeFormat(locales, {
      timeStyle: 'short',
    });

    const date = new Date(message.sentDate);
    const writtenByMe = message.author === this.props.localId;

    return (
      <Message
        data-local={writtenByMe}
        data-test="chat-message"
        key={message.sentDate}
      >
        <MessageTimestamp
          data-test="chat-message-timestamp"
          dateTime={message.sentDate}
        >
          {formatter.format(date)}
        </MessageTimestamp>

        <MessageBody data-local={writtenByMe} data-test="chat-message-body">
          {message.body}
        </MessageBody>
      </Message>
    );
  };

  // As soon as it mounts, start at the bottom of the message list, then
  // scroll each message into view as you send it.
  setScrollTarget = (target: null | HTMLSpanElement) => {
    this.scrollTarget = target;
    target?.scrollIntoView();
  };
}

interface Props {
  messages: Array<ChatMessage>;
  localId: string;
}

const Container = styled.ol.attrs({ role: 'log' })`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  margin: 0;
  margin-top: auto;
  padding: 0.5rem;
  padding-bottom: 0;
  list-style-type: none;
`;

const MessageBody = styled.p`
  background-color: ${css.color('white')};
  color: ${css.color('background')};
  margin: 0;
  padding: 0.5rem;
  border-radius: ${css.radius};
  white-space: pre-wrap;
  overflow-wrap: break-word;

  // Should be about 2/3 the width of <ChatPanel>.
  max-width: 200px;

  &[data-local='true'] {
    background-color: ${css.color('primary')};
  }
`;

const MessageTimestamp = styled.time`
  padding: 0.5rem;
  opacity: 0.75;
  font-size: 0.75rem;
  text-transform: lowercase;
  visibility: hidden;
`;

const Message = styled.li`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;

  &[data-local='false'] {
    flex-direction: row-reverse;
  }

  :hover ${MessageTimestamp}, :focus ${MessageTimestamp} {
    visibility: visible;
  }

  :not(:last-child) {
    margin-bottom: 0.25rem;
  }

  &[data-local='false'] + &[data-local='true'],
  &[data-local='true'] + &[data-local='false'] {
    margin-top: 1rem;
  }
`;

export function mapStateToProps({ relay, participants, call }: State) {
  assert(relay, 'Missing local ID.');
  assert(call, 'No call in progress.');

  const participant = participants[call.peerId];
  assert(participant, `Participant ID is invalid (id=${call.peerId})`);

  return {
    localId: relay.localId,
    messages: participant.chat.history,
  };
}

export default connect(mapStateToProps)(MessageLog);
