import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { State } from '../reducers/initial-state';
import * as css from '../utils/css';

export class ChatPanel extends React.Component<Props> {
  render() {
    const { showChatPanel } = this.props;

    if (!showChatPanel) {
      return null;
    }

    return (
      <Container>
        <h1>Future home of chat.</h1>
      </Container>
    );
  }
}

interface Props {
  showChatPanel: boolean;
}

const Container = styled.aside.attrs({ role: 'complementary' })`
  display: flex;
  background-color: ${css.color('background')};

  @media screen and (max-width: ${css.breakpoint.mobile}) {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${css.color('overlay')};
  }
`;

export function mapStateToProps(state: State) {
  return {
    showChatPanel: state.chat.open,
  };
}

export default connect(mapStateToProps)(ChatPanel);
