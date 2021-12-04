import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import { Button, TextInput } from '../core';
import * as actions from '../../actions';
import { State as ReduxState } from '../../reducers/initial-state';

export class IceServer extends React.Component<Props, State> {
  state = { url: '' };

  urlInputId = uuid();

  render() {
    return (
      <Form data-test="form" onSubmit={this.submit}>
        <InputGroup>
          <InputName htmlFor={this.urlInputId}>Server URL</InputName>

          <TextInput
            data-test="url-input"
            id={this.urlInputId}
            placeholder="example.com:3478"
            onChange={this.updateUrlInput}
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

  syncWithFormKey =
    (key: keyof State) => (event: React.SyntheticEvent<HTMLInputElement>) => {
      this.setState({ [key]: event.currentTarget.value });
    };

  updateUrlInput = this.syncWithFormKey('url');

  submit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    const { iceServers, id } = this.props;

    event.preventDefault();
    event.stopPropagation();

    const customIceServers = iceServers.slice();
    customIceServers.splice(id, 1, {
      urls: this.state.url,
    });

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
