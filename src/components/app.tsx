import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';

export class App extends React.Component<Props> {
  componentDidMount() {
    this.props.requestMediaDevices();
  }

  render() {
    return <h1>Hello, world</h1>;
  }
}

interface Props {
  requestMediaDevices: typeof actions.devices.requestMediaDevices;
}

const mapDispatchToProps = {
  requestMediaDevices: actions.devices.requestMediaDevices,
};

export default connect(null, mapDispatchToProps)(App);
