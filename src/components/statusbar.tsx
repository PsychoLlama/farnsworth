import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import * as css from '../utils/css';
import { State } from '../reducers/initial-state';

/**
 * Show the real-time connection status of the signaling server.
 *
 * TODO: Link this up with the signaling client.
 *
 * Stretch goal: show nerd stats in a debugging panel.
 */
export class Statusbar extends React.Component<Props> {
  render() {
    const { connected, dialAddress } = this.props;

    return (
      <Container>
        {connected ? dialAddress : <StatusText>Connecting...</StatusText>}
      </Container>
    );
  }
}

interface Props {
  dialAddress: string;
  connected: boolean;
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

export function mapStateToProps({ relay }: State) {
  return {
    connected: Boolean(relay),
    dialAddress: relay
      ? `${relay.server}/p2p-circuit/p2p/${relay.localId}`
      : '',
  };
}

export default connect(mapStateToProps)(Statusbar);
