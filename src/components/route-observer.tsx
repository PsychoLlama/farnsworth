import React from 'react';
import { connect } from 'react-redux';
import { State } from '../reducers/initial-state';
import * as actions from '../actions';
import { Routes, MY_PARTICIPANT_ID } from '../utils/constants';

export class RouteObserver extends React.Component<Props> {
  componentDidUpdate(prevProps: Props) {
    if (!this.readyToCall(prevProps) && this.readyToCall(this.props)) {
      const { peerId } = this.props.route.params;
      this.props.dial(`${this.props.relayServer}/p2p-circuit/p2p/${peerId}`);
    }
  }

  render() {
    return this.props.children;
  }

  readyToCall(props: Props) {
    return (
      props.route.id === Routes.Call &&
      props.relayServer !== null &&
      props.hasLocalTracks
    );
  }
}

interface Props {
  route: State['route'];
  relayServer: string | null;
  children?: React.ReactNode;
  hasLocalTracks: boolean;
  dial: typeof actions.connections.dial;
}

export function mapStateToProps(state: State) {
  return {
    route: state.route,
    relayServer: state.relay?.server ?? null,
    hasLocalTracks: state.participants[MY_PARTICIPANT_ID].trackIds.length > 0,
  };
}

const mapDispatchToProps = {
  dial: actions.connections.dial,
};

export default connect(mapStateToProps, mapDispatchToProps)(RouteObserver);
