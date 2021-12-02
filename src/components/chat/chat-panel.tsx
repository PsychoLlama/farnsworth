import React from 'react';
import styled from 'styled-components';
import MessageLog from './message-log';
import MessageComposer from './message-composer';

export class ChatPanel extends React.Component<Props> {
  render() {
    return (
      <Container id={this.props.panelId}>
        <MessageLog />

        <MessageComposer />
      </Container>
    );
  }
}

interface Props {
  panelId: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`;

export default ChatPanel;
