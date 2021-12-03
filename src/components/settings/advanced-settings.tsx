import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import * as actions from '../../actions';
import { STUN_SERVERS } from '../../utils/constants';
import { State, Settings } from '../../reducers/initial-state';

export class AdvancedSettings extends React.Component<Props> {
  render() {
    const { iceServers } = this.props;

    const defaultIceServers = STUN_SERVERS.map((url) => ({
      urls: `stun:${url}`,
    }));

    return (
      <details
        data-test="advanced-settings"
        onToggle={this.loadSettingsWhenOpened}
      >
        <Summary>Advanced settings</Summary>

        <Subtitle>ICE servers</Subtitle>

        <IceServers>
          {iceServers.concat(defaultIceServers).map(this.renderIceServer)}
        </IceServers>
      </details>
    );
  }

  loadSettingsWhenOpened = (
    event: React.SyntheticEvent<HTMLDetailsElement>,
  ) => {
    if (event.currentTarget.open) {
      this.props.loadSettings();
    }
  };

  renderIceServer = (server: RTCIceServer, index: number) => {
    // Coerce all URLs to an array.
    const servers = [].concat(server.urls).map((addr) => {
      const [type, ...rest] = addr.split(':');
      const url = rest.join(':');
      return { type, url };
    });

    return (
      <React.Fragment key={index}>
        {servers.map((server) => (
          <li
            data-test="ice-server-address"
            key={`${index}:${server.type}:${server.url}`}
          >
            {server.url} ({server.type})
          </li>
        ))}
      </React.Fragment>
    );
  };
}

interface Props {
  loadSettings: typeof actions.settings.load;
  iceServers: Settings['iceServers'];
}

const Summary = styled.summary`
  cursor: default;
`;

const Subtitle = styled.h3`
  margin: 0;
  margin-top: 1rem;
`;

const IceServers = styled.ol`
  display: grid;
  grid-row-gap: 0.5rem;
  margin: 0;
  padding: 1rem;
  list-style-type: disc;
  list-style-position: inside;
`;

export function mapStateToProps(state: State) {
  const { iceServers, forceTurnRelay, useDefaultIceServers } = state.settings;

  return {
    iceServers,
    forceTurnRelay,
    useDefaultIceServers,
  };
}

const mapDispatchToProps = {
  loadSettings: actions.settings.load,
};

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedSettings);
