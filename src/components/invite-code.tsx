import React from 'react';
import { connect } from 'react-redux';
import { Button } from './core';
import { State as ReduxState } from '../reducers/initial-state';
import debounce from '../utils/debounce';

export class InviteCode extends React.Component<Props, State> {
  state = {
    showCopySuccessMessage: false,
  };

  render() {
    const { showCopySuccessMessage } = this.state;

    return (
      <Button.Primary data-test="copy-code" onClick={this.copy}>
        {showCopySuccessMessage ? 'Copied!' : 'Copy Invite Code'}
      </Button.Primary>
    );
  }

  copy = async () => {
    const { localId } = this.props;
    await navigator.clipboard.writeText(localId);
    this.setState({ showCopySuccessMessage: true });
    this.scheduleNoticeDismissal();
  };

  scheduleNoticeDismissal = debounce(2000, () => {
    this.setState({ showCopySuccessMessage: false });
  });
}

interface Props {
  localId: string;
}

interface State {
  showCopySuccessMessage: boolean;
}

export function mapStateToProps({ relay }: ReduxState) {
  return {
    localId: relay?.localId ?? '',
  };
}

export default connect(mapStateToProps)(InviteCode);
