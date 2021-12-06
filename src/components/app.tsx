import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import * as actions from '../actions';
import VideoRoomLayout from './media/video-room-layout';
import { SERVER_ADDRESS } from '../utils/constants';
import RouteObserver from './route-observer';
import KeyboardObserver from './keyboard-observer';
import { State } from '../reducers/initial-state';
import DeviceErrorModal from './device-error-modal';

export class App extends React.Component<Props> {
  async componentDidMount() {
    // The only time this happens is during development, when the `<App>`
    // component is hot reloaded. Trying to initialize the app again messes
    // everything up and can cause errors.
    if (this.props.appInitialized) {
      return;
    }

    await Promise.allSettled([
      this.props.requestMediaDevices({
        audio: true,
        video: true,
      }),

      // Opens a connection to the relay server.
      this.props.connectToServer(SERVER_ADDRESS),
    ]);

    // If GUM is successful, the output of `loadDeviceList()` might be
    // different as browsers reveal more device information after the first
    // successful query. But we still want to grab them even if it fails.
    //
    // Similarly, `enumerateDeviceList()` can fail for unexpected and
    // nonsensical reasons. That's okay. It will correct itself after the next
    // device change event, courtesy of `observe()`.
    await Promise.allSettled([this.props.loadDeviceList()]);

    this.props.observeDeviceList();
  }

  render() {
    return (
      <KeyboardObserver>
        <RouteObserver>
          <Container>
            <VideoRoomLayout />
            <DeviceErrorModal />
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
  loadDeviceList: typeof actions.devices.list;
  observeDeviceList: typeof actions.devices.observe;
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
  loadDeviceList: actions.devices.list,
  observeDeviceList: actions.devices.observe,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
