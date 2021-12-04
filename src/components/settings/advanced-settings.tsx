import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import * as actions from '../../actions';
import { ICE_SERVERS } from '../../utils/constants';
import { State, WebrtcSettings } from '../../reducers/initial-state';
import { Switch } from '../core';
import * as css from '../../utils/css';

export class AdvancedSettings extends React.Component<Props> {
  render() {
    const { customIceServers, forceTurnRelay, disableDefaultIceServers } =
      this.props;

    const iceServers = (disableDefaultIceServers ? [] : ICE_SERVERS).concat(
      customIceServers,
    );

    return (
      <Disclosure
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

        <OverflowCatch>
          <IceServers>
            <Subtitle>ICE servers</Subtitle>
            <thead>
              <tr>
                <TableHeader>Address</TableHeader>
                <TableHeader>Type</TableHeader>
              </tr>
            </thead>

            <tbody>
              {iceServers.length ? (
                iceServers.map(this.renderIceServer)
              ) : (
                <tr>
                  <NoIceServers colSpan={2} data-test="no-ice-servers">
                    No ICE servers.
                  </NoIceServers>
                </tr>
              )}
            </tbody>
          </IceServers>
        </OverflowCatch>
      </Disclosure>
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
          <tr key={`${index}:${server.type}:${server.url}`}>
            <TableCell data-test="ice-server-address">{server.url}</TableCell>
            <IceServerType>{server.type}</IceServerType>
          </tr>
        ))}
      </React.Fragment>
    );
  };
}

interface Props extends WebrtcSettings {
  loadSettings: typeof actions.settings.load;
  updateSettings: typeof actions.settings.update;
}

const Disclosure = styled.details`
  width: 100%;
  overflow: hidden;
`;

const Summary = styled.summary`
  cursor: default;
`;

// <table> elements are finicky about horizontal scroll.
const OverflowCatch = styled.div`
  width: 100%;
  overflow: auto;
`;

const IceServers = styled.table`
  width: 100%;
  border-collapse: collapse;
  overflow: auto;
`;

const Subtitle = styled.caption`
  text-align: left;
  margin: 1rem 0;
  font-weight: bold;
  font-size: 120%;
`;

const TableHeader = styled.th`
  border: 1px solid ${css.color('foreground')};
  background-color: ${css.color('foreground')};
  color: ${css.color('background')};
  padding: 0.5rem;
`;

const TableCell = styled.td`
  padding: 0.5rem;
  border: 1px solid ${css.color('white')};
  background-color: ${css.color('background')};
`;

const IceServerType = styled(TableCell)`
  text-align: center;
  text-transform: uppercase;
`;

const NoIceServers = styled(TableCell)`
  border: 1px solid ${css.color('white')};
  font-style: italic;
  padding: 1rem;
  opacity: 0.5;
  text-align: center;
`;

export function mapStateToProps(state: State) {
  return state.settings.webrtc;
}

const mapDispatchToProps = {
  loadSettings: actions.settings.load,
  updateSettings: actions.settings.update,
};

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedSettings);
