import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import * as actions from '../actions';
import VideoRoomLayout from './media/video-room-layout';
import { SERVER_ADDRESS } from '../utils/constants';
import RouteObserver from './route-observer';
import KeyboardObserver from './keyboard-observer';
import { State } from '../reducers/initial-state';

export class App extends React.Component<Props> {
  async componentDidMount() {
    // The only time this happens is during development, when the `<App>`
    // component is hot reloaded. Trying to initialize the app again messes
    // everything up and can cause errors.
    if (this.props.appInitialized) {
      return;
    }

    this.props.requestMediaDevices();

    // Opens a connection to the relay server.
    this.props.connectToServer(SERVER_ADDRESS);
  }

  render() {
    return (
      <KeyboardObserver>
        <RouteObserver>
          <Container>
            <VideoRoomLayout />
          </Container>
        </RouteObserver>
      </KeyboardObserver>
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
  appInitialized: boolean;
}

export function mapStateToProps(state: State) {
  return {
    // This is a good approximation.
    appInitialized: state.relay !== null,
  };
}

const mapDispatchToProps = {
  requestMediaDevices: actions.devices.requestMediaDevices,
  connectToServer: actions.connections.listen,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
