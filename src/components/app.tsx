import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import styled from 'styled-components';
import SelfPreview from './media/self-preview';

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
        <SelfPreview />
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
}

const mapDispatchToProps = {
  requestMediaDevices: actions.devices.requestMediaDevices,
};

export default connect(null, mapDispatchToProps)(App);
