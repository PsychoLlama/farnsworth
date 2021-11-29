import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { FiX } from 'react-icons/fi';
import { State } from '../../reducers/initial-state';
import * as css from '../../utils/css';
import { Button } from '../core';
import * as actions from '../../actions';
import MessageLog from './message-log';
import MessageComposer from './message-composer';

export class ChatPanel extends React.Component<Props> {
  render() {
    const { showChatPanel, close } = this.props;

    if (!showChatPanel) {
      return null;
    }

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
  showChatPanel: boolean;
  close: typeof actions.chat.close;
}

const Container = styled.aside.attrs({ role: 'complementary' })`
  display: flex;
  background-color: ${css.color('background')};
  flex-direction: column;
  min-width: 315px;
  box-shadow: inset 0 -4px 4px -4px rgba(0, 0, 0, 0.4);

  @media screen and (max-width: ${css.breakpoint.mobile}) {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${css.color('overlay')};
    min-width: 0;
    box-shadow: none;
  }
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

export function mapStateToProps(state: State) {
  return {
    showChatPanel: state.chat.open,
  };
}

const mapDispatchToProps = {
  close: actions.chat.close,
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatPanel);
