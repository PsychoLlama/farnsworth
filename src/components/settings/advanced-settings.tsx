import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import * as actions from '../../actions';
import { ICE_SERVERS } from '../../utils/constants';
import { State, WebrtcSettings } from '../../reducers/initial-state';
import { Switch, Button } from '../core';
import * as css from '../../utils/css';

export class AdvancedSettings extends React.Component<Props> {
  render() {
    const { customIceServers, forceTurnRelay, disableDefaultIceServers } =
      this.props;

    const defaultIceServers = disableDefaultIceServers ? [] : ICE_SERVERS;

    return (
      <Disclosure
        data-test="advanced-settings"
        onToggle={this.loadSettingsWhenOpened}
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
              {defaultIceServers.map(this.renderIceServer(false))}
              {customIceServers.map(this.renderIceServer(true))}

              <tr>
                <WideCell>
                  <Button.Subtle
                    data-test="add-ice-server"
                    onClick={this.addIceServer}
                  >
                    Add server
                  </Button.Subtle>
                </WideCell>
              </tr>
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

  addIceServer = () => {
    this.props.onEditIceServer({
      id: this.props.customIceServers.length,
    });
  };

  loadSettingsWhenOpened = (
    event: React.SyntheticEvent<HTMLDetailsElement>,
  ) => {
    if (event.currentTarget.open) {
      this.props.loadSettings();
    }
  };

  renderIceServer =
    (custom: boolean) => (server: RTCIceServer, index: number) => {
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
              <TableCell data-test="ice-server-address">
                {custom ? (
                  <Button.Subtle
                    data-test="edit-ice-server"
                    data-id={index}
                    onClick={this.editIceServer}
                    title="Edit server"
                  >
                    {server.url}
                  </Button.Subtle>
                ) : (
                  server.url
                )}
              </TableCell>

              <IceServerType>{server.type}</IceServerType>
            </tr>
          ))}
        </React.Fragment>
      );
    };

  editIceServer = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    this.props.onEditIceServer({
      id: Number(event.currentTarget.dataset.id),
    });
  };
}

interface Props extends WebrtcSettings {
  loadSettings: typeof actions.settings.load;
  updateSettings: typeof actions.settings.update;
  onEditIceServer({ id: number }): unknown;
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

const WideCell = styled(TableCell).attrs({ colSpan: 2 })`
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
