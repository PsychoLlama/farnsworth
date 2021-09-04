import React from 'react';
import { connect } from 'react-redux';
import { Button } from './core';
import { State } from '../reducers/initial-state';

export class InviteLink extends React.Component<Props> {
  render() {
    return (
      <Button.Primary onClick={this.copy}>Copy Invite Link</Button.Primary>
    );
  }

  copy = () => {
    // TODO: Copy the link
  };
}

interface Props {
  dialAddress: string;
  connected: boolean;
}

export function mapStateToProps({ relay }: State) {
  return {
    connected: Boolean(relay),
    dialAddress: relay
      ? `${relay.server}/p2p-circuit/p2p/${relay.localId}`
      : '',
  };
}

export default connect(mapStateToProps)(InviteLink);
