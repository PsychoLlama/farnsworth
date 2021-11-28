import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import assert from 'assert';
import { State, ChatMessage } from '../../reducers/initial-state';
import * as css from '../../utils/css';
import { PANEL_WIDTH } from './chat-panel';

export class MessageLog extends React.Component<Props> {
  render() {
    return (
      <Container aria-atomic aria-live="polite">
        {this.props.messages.map(this.renderMessage)}
      </Container>
    );
  }

  renderMessage = (message: ChatMessage) => {
    const locales = navigator.languages.slice();
    const formatter = new Intl.DateTimeFormat(locales, {
      timeStyle: 'short',
    });

    const date = new Date(message.sentDate);

    return (
      <Message data-test="chat-message" key={message.sentDate}>
        <MessageTimestamp
          data-test="chat-message-timestamp"
          dateTime={message.sentDate}
        >
          {formatter.format(date)}
        </MessageTimestamp>

        <MessageBody data-test="chat-message-body">{message.body}</MessageBody>
      </Message>
    );
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
  flex-grow: 1;
  margin: 0;
  padding: 0.5rem;
  padding-bottom: 0;
  list-style-type: none;
`;

const MessageBody = styled.p`
  background-color: ${css.color('primary')};
  color: ${css.color('background')};
  margin: 0;
  padding: 0.5rem;
  border-radius: ${css.radius};
  white-space: pre-wrap;
  overflow-wrap: break-word;
  max-width: calc(${PANEL_WIDTH} / 2);
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
  flex-grow: 1;

  :hover ${MessageTimestamp}, :focus ${MessageTimestamp} {
    visibility: visible;
  }

  :not(:last-child) {
    margin-bottom: 0.25rem;
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
