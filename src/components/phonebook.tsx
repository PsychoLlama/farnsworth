import React from 'react';
import styled from 'styled-components';
import { FiPhoneOutgoing } from 'react-icons/fi';
import { connect } from 'react-redux';
import InviteCode from './invite-code';
import { Button, Input } from './core';
import * as actions from '../actions';
import { State as ReduxState } from '../reducers/initial-state';

export class Phonebook extends React.Component<Props, State> {
  state = {
    peerId: '',
  };

  render() {
    return (
      <Container>
        <InviteCode />

        <CallingForm data-test="invite-code-form" onSubmit={this.call}>
          <InviteInput
            data-test="invite-code-input"
            placeholder="Invite code"
            value={this.state.peerId}
            onChange={this.updateInviteCode}
          />

          <Button.Primary type="submit">
            <FiPhoneOutgoing />
          </Button.Primary>
        </CallingForm>
      </Container>
    );
  }

  call = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.stopPropagation();
    event.preventDefault();

    const { relayServer } = this.props;
    const { peerId } = this.state;
    this.clearInput();

    this.props.dial(`${relayServer}/p2p-circuit/p2p/${peerId}`);
  };

  clearInput = () => {
    this.setState({ peerId: '' });
  };

  updateInviteCode = (peerId: string) => {
    this.setState({ peerId });
  };
}

interface Props {
  dial: typeof actions.connections.dial;
  relayServer: string;
}

interface State {
  peerId: string;
}

const Container = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem;
`;

const CallingForm = styled.form`
  display: flex;
  margin: 0;
`;

const InviteInput = styled(Input)`
  margin-right: 1rem;
`;

const mapDispatchToProps = {
  dial: actions.connections.dial,
};

export function mapStateToProps({ relay }: ReduxState) {
  return {
    relayServer: relay?.server ?? '',
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Phonebook);
