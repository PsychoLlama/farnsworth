import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import * as actions from '../actions';
import VideoRoomLayout from './media/video-room-layout';
import { SERVER_ADDRESS } from '../utils/constants';
import RouteObserver from './route-observer';

export class App extends React.Component<Props> {
  async componentDidMount() {
    this.props.requestMediaDevices();

    // Opens a connection to the relay server.
    this.props.connectToServer(SERVER_ADDRESS);
  }

  render() {
    return (
      <RouteObserver>
        <Container>
          <VideoRoomLayout />
        </Container>
      </RouteObserver>
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
