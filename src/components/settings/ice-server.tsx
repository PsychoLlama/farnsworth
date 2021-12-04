import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import { Button, TextInput, Dropdown } from '../core';
import * as actions from '../../actions';
import { State as ReduxState } from '../../reducers/initial-state';

export class IceServer extends React.Component<Props, State> {
  urlInputId = uuid();
  passwordInputId = uuid();
  usernameInputId = uuid();
  state = {
    serverType: ServerType.Stun,
    url: '',
    username: '',
    token: '',
  };

  render() {
    const { serverType } = this.state;

    return (
      <Form data-test="form" onSubmit={this.submit}>
        <InputGroup>
          <InputName htmlFor={this.urlInputId}>Server URL</InputName>

          <PrefixedInput>
            <ServerTypeDropdown
              value={serverType}
              data-test="server-type"
              onChange={this.updateServerType}
            >
              <ServerTypeOption value={ServerType.Stun}>stun</ServerTypeOption>
              <ServerTypeOption value={ServerType.Turn}>turn</ServerTypeOption>
            </ServerTypeDropdown>

            <ServerUrlInput
              data-test="url-input"
              id={this.urlInputId}
              placeholder="example.com:3478"
              onChange={this.updateUrlInput}
            />
          </PrefixedInput>
        </InputGroup>

        <InputGroup>
          <InputName htmlFor={this.usernameInputId}>Username</InputName>

          <TextInput
            placeholder="User (optional)"
            id={this.usernameInputId}
            data-test="username-input"
            onChange={this.updateUsername}
          />
        </InputGroup>

        <InputGroup>
          <InputName htmlFor={this.passwordInputId}>Password</InputName>

          <TextInput
            placeholder="Secret (optional)"
            id={this.passwordInputId}
            data-test="password-input"
            onChange={this.updateToken}
          />
        </InputGroup>

        <Buttons>
          <Button.Primary type="submit">Save</Button.Primary>

          <Button.Subtle data-test="cancel-button" onClick={this.props.onClose}>
            Cancel
          </Button.Subtle>
        </Buttons>
      </Form>
    );
  }

  updateUrlInput = (event: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ url: event.currentTarget.value });
  };

  updateServerType = (event: React.SyntheticEvent<HTMLSelectElement>) => {
    this.setState({ serverType: event.currentTarget.value as ServerType });
  };

  updateUsername = (event: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ username: event.currentTarget.value });
  };

  updateToken = (event: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ token: event.currentTarget.value });
  };

  submit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    const { iceServers, id } = this.props;
    const { serverType, url, username, token } = this.state;
    const customIceServers = iceServers.slice();

    event.preventDefault();
    event.stopPropagation();

    const server: RTCIceServer = {
      urls: `${serverType}:${url}`,
    };

    if (username || token) {
      server.credentialType = 'password';
      server.username = username;
      server.credential = token;
    }

    customIceServers.splice(id, 1, server);

    await this.props.updateSettings({ customIceServers });
    this.props.onClose();
  };
}

interface Props {
  updateSettings: typeof actions.settings.update;
  onClose(): unknown;
  id: number;
  iceServers: Array<RTCIceServer>;
}

interface State {
  url: string;
  serverType: ServerType;
  username: string;
  token: string;
}

export enum ServerType {
  Stun = 'stun',
  Turn = 'turn',
}

const Form = styled.form`
  display: grid;
  padding: 1rem;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: grid;
  gap: 0.5rem;
`;

const InputName = styled.label`
  font-weight: bold;
  width: max-content;
`;

const PrefixedInput = styled.div`
  display: flex;
`;

const ServerTypeDropdown = styled(Dropdown)`
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: 0;
`;

const ServerTypeOption = styled.option`
  text-transform: uppercase;
`;

const ServerUrlInput = styled(TextInput)`
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  flex-grow: 1;
`;

const Buttons = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  justify-content: start;
  direction: rtl;
  gap: 1rem;
`;

export function mapStateToProps(state: ReduxState) {
  return {
    iceServers: state.settings.webrtc.customIceServers,
  };
}

const mapDispatchToProps = {
  updateSettings: actions.settings.update,
};

export default connect(mapStateToProps, mapDispatchToProps)(IceServer);
