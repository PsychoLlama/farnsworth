import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import Participant from './participant';
import { MY_PARTICIPANT_ID } from '../utils/constants';

export class App extends React.Component<Props> {
  async componentDidMount() {
    this.props.requestMediaDevices();

    // Opens a connection to the relay server.
    const signaling = await import('../conferencing/signaling');
    await signaling.init();
  }

  render() {
    return <Participant id={MY_PARTICIPANT_ID} />;
  }
}

interface Props {
  requestMediaDevices: typeof actions.devices.requestMediaDevices;
}

const mapDispatchToProps = {
  requestMediaDevices: actions.devices.requestMediaDevices,
};

export default connect(null, mapDispatchToProps)(App);
