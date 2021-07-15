import React from 'react';
import styled from 'styled-components';
import * as css from '../utils/css';

/**
 * Show the real-time connection status of the signaling server.
 *
 * TODO: Link this up with the signaling client.
 *
 * Stretch goal: show nerd stats in a debugging panel.
 */
export default class Statusbar extends React.Component {
  render() {
    return (
      <Container>
        <StatusText>Connecting...</StatusText>
      </Container>
    );
  }
}

const Container = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem;
  border-bottom: 1px solid ${css.color('white')};
`;

const StatusText = styled.p`
  margin: 0;
`;
