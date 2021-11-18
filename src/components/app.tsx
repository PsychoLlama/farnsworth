import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import * as actions from '../actions';
import VideoRoomLayout from './media/video-room-layout';
import { SERVER_ADDRESS } from '../utils/constants';
import Logger from '../utils/logger';

const logger = new Logger('<App>');

export class App extends React.Component<Props> {
  async componentDidMount() {
    window.addEventListener('beforeunload', this.unload);

    this.props.requestMediaDevices();

    // Opens a connection to the relay server.
    this.props.connectToServer(SERVER_ADDRESS);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.unload);
  }

  render() {
    return (
      <Container>
        <VideoRoomLayout />
      </Container>
    );
  }

  private unload = () => {
    logger.warn('Window is unloading');
    this.props.closeAllConnections();
  };
}

const Container = styled.div`
  display: flex;
  flex-grow: 1;
`;

interface Props {
  requestMediaDevices: typeof actions.devices.requestMediaDevices;
  connectToServer: typeof actions.connections.listen;
  closeAllConnections: typeof actions.connections.shutdown;
}

const mapDispatchToProps = {
  requestMediaDevices: actions.devices.requestMediaDevices,
  connectToServer: actions.connections.listen,
  closeAllConnections: actions.connections.shutdown,
};

export default connect(null, mapDispatchToProps)(App);
