import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import * as actions from '../../actions';
import { STUN_SERVERS } from '../../utils/constants';
import { State, Settings } from '../../reducers/initial-state';
import { Switch } from '../core';

export class AdvancedSettings extends React.Component<Props> {
  render() {
    const { customIceServers, forceTurnRelay, disableDefaultIceServers } =
      this.props;

    const defaultIceServers = disableDefaultIceServers
      ? []
      : STUN_SERVERS.map((url) => ({ urls: `stun:${url}` }));

    return (
      <details
        data-test="advanced-settings"
        onToggle={this.loadSettingsWhenOpened}
        open
      >
        <Summary>Advanced settings</Summary>

        <Switch
          data-test="toggle-turn-relay"
          value={forceTurnRelay}
          onChange={this.toggleTurnRelay}
        >
          Force TURN relay
        </Switch>

        <Switch
          data-test="toggle-default-ice-servers"
          value={disableDefaultIceServers}
          onChange={this.toggleDefaultIceServers}
        >
          Disable default ICE servers
        </Switch>

        <Subtitle>ICE servers</Subtitle>

        <IceServers>
          {customIceServers.concat(defaultIceServers).map(this.renderIceServer)}
        </IceServers>
      </details>
    );
  }

  toggleTurnRelay = (event: React.SyntheticEvent<HTMLInputElement>) => {
    return this.props.updateSettings({
      forceTurnRelay: event.currentTarget.checked,
    });
  };

  toggleDefaultIceServers = (event: React.SyntheticEvent<HTMLInputElement>) => {
    return this.props.updateSettings({
      disableDefaultIceServers: event.currentTarget.checked,
    });
  };

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

interface Props extends Settings {
  loadSettings: typeof actions.settings.load;
  updateSettings: typeof actions.settings.update;
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
  return state.settings;
}

const mapDispatchToProps = {
  loadSettings: actions.settings.load,
  updateSettings: actions.settings.update,
};

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedSettings);
