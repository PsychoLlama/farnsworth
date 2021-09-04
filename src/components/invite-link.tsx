import React from 'react';
import { connect } from 'react-redux';
import { Button } from './core';
import { State as ReduxState } from '../reducers/initial-state';
import debounce from '../utils/debounce';

export class InviteLink extends React.Component<Props, State> {
  state = {
    showCopySuccessMessage: false,
  };

  render() {
    const { showCopySuccessMessage } = this.state;

    return (
      <Button.Primary data-test="copy-invite" onClick={this.copy}>
        {showCopySuccessMessage ? 'Copied!' : 'Copy Invite Link'}
      </Button.Primary>
    );
  }

  copy = async () => {
    const { dialAddress } = this.props;
    await navigator.clipboard.writeText(dialAddress);
    this.setState({ showCopySuccessMessage: true });
    this.scheduleNoticeDismissal();
  };

  scheduleNoticeDismissal = debounce(2000, () => {
    this.setState({ showCopySuccessMessage: false });
  });
}

interface Props {
  dialAddress: string;
  connected: boolean;
}

interface State {
  showCopySuccessMessage: boolean;
}

export function mapStateToProps({ relay }: ReduxState) {
  return {
    connected: Boolean(relay),
    dialAddress: relay
      ? `${relay.server}/p2p-circuit/p2p/${relay.localId}`
      : '',
  };
}

export default connect(mapStateToProps)(InviteLink);
