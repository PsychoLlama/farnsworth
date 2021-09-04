import React from 'react';
import styled from 'styled-components';
import { FiPhoneOutgoing } from 'react-icons/fi';
import InviteLink from './invite-link';
import { Button, Input } from './core';

export class Phonebook extends React.Component<Record<string, never>, State> {
  state = {
    inviteLink: '',
  };

  render() {
    return (
      <Container>
        <InviteLink />

        <CallingForm data-test="invite-link-form" onSubmit={this.call}>
          <InviteInput
            data-test="invite-link-input"
            placeholder="Invite link"
            value={this.state.inviteLink}
            onChange={this.updateInviteLink}
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
    this.setState({ inviteLink: '' });
  };

  updateInviteLink = (inviteLink: string) => {
    this.setState({ inviteLink });
  };
}

interface State {
  inviteLink: string;
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
