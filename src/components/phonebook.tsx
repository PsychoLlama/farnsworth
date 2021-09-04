import React from 'react';
import styled from 'styled-components';
import { FiPhoneOutgoing } from 'react-icons/fi';
import InviteCode from './invite-code';
import { Button, Input } from './core';

export class Phonebook extends React.Component<Record<string, never>, State> {
  state = {
    inviteCode: '',
  };

  render() {
    return (
      <Container>
        <InviteCode />

        <CallingForm data-test="invite-code-form" onSubmit={this.call}>
          <InviteInput
            data-test="invite-code-input"
            placeholder="Invite code"
            value={this.state.inviteCode}
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

    this.clearInput();
    // TODO: Dial the other peer.
  };

  clearInput = () => {
    this.setState({ inviteCode: '' });
  };

  updateInviteCode = (inviteCode: string) => {
    this.setState({ inviteCode });
  };
}

interface State {
  inviteCode: string;
}

const Container = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
`;

const CallingForm = styled.form`
  display: flex;
  margin: 0;
`;

const InviteInput = styled(Input)`
  margin-right: 1rem;
`;

export default Phonebook;
