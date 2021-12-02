import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { FiX } from 'react-icons/fi';
import * as css from '../../utils/css';
import { Button } from '../core';
import * as actions from '../../actions';
import MessageLog from './message-log';
import MessageComposer from './message-composer';

export class ChatPanel extends React.Component<Props> {
  render() {
    const { close } = this.props;

    return (
      <Container>
        <Header>
          <Title>Chat</Title>
          <CloseButton data-test="close-chat" onClick={close}>
            <FiX aria-label="Close chat" />
          </CloseButton>
        </Header>

        <MessageLog />

        <MessageComposer />
      </Container>
    );
  }
}

interface Props {
  close: typeof actions.panel.close;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  background-color: ${css.color('background')};
`;

const Title = styled.h2`
  margin: 0;
`;

const CloseButton = styled(Button.Base)`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
`;

const mapDispatchToProps = {
  close: actions.panel.close,
};

export default connect(null, mapDispatchToProps)(ChatPanel);
