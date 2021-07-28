import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import styled from 'styled-components';
import SelfPreview from './media/self-preview';
import Sidebar from './sidebar';
import { SERVER_ADDRESS } from '../utils/constants';

export class App extends React.Component<Props> {
  async componentDidMount() {
    this.props.requestMediaDevices();

    // Opens a connection to the relay server.
    this.props.connectToServer(SERVER_ADDRESS);
  }

  render() {
    return (
      <Container>
        <SelfPreview />
        <Sidebar />
      </Container>
    );
  }
}

const Container = styled.div`
  display: flex;
  flex-grow: 1;
`;

interface Props {
  requestMediaDevices: typeof actions.devices.requestMediaDevices;
  connectToServer: typeof actions.connections.listen;
}

const mapDispatchToProps = {
  requestMediaDevices: actions.devices.requestMediaDevices,
  connectToServer: actions.connections.listen,
};

export default connect(null, mapDispatchToProps)(App);
