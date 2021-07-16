import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import Participant from './media/participant';
import Sidebar from './sidebar';
import { MY_PARTICIPANT_ID } from '../utils/constants';
import styled from 'styled-components';

export class App extends React.Component<Props> {
  async componentDidMount() {
    this.props.requestMediaDevices();

    // Opens a connection to the relay server.
    const signaling = await import('../conferencing/signaling');
    await signaling.init();
  }

  render() {
    return (
      <Container>
        <Participant id={MY_PARTICIPANT_ID} />
        <Sidebar />
      </Container>
    );
  }
}

const Container = styled.div`
  display: flex;
`;

interface Props {
  requestMediaDevices: typeof actions.devices.requestMediaDevices;
}

const mapDispatchToProps = {
  requestMediaDevices: actions.devices.requestMediaDevices,
};

export default connect(null, mapDispatchToProps)(App);
