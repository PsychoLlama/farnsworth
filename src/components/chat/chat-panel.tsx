import React from 'react';
import styled from 'styled-components';
import MessageLog from './message-log';
import MessageComposer from './message-composer';

export class ChatPanel extends React.Component {
  render() {
    return (
      <Container>
        <MessageLog />

        <MessageComposer />
      </Container>
    );
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`;

export default ChatPanel;
