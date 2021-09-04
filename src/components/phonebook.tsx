import React from 'react';
import styled from 'styled-components';
import { FiPhoneOutgoing } from 'react-icons/fi';
import { connect } from 'react-redux';
import InviteCode from './invite-code';
import { Button, Input } from './core';
import * as actions from '../actions';

export class Phonebook extends React.Component<Props, State> {
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

    const { inviteCode } = this.state;
    this.clearInput();

    this.props.dial(inviteCode);
  };

  clearInput = () => {
    this.setState({ inviteCode: '' });
  };

  updateInviteCode = (inviteCode: string) => {
    this.setState({ inviteCode });
  };
}

interface Props {
  dial: typeof actions.connections.dial;
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

const mapDispatchToProps = {
  dial: actions.connections.dial,
};

export default connect(null, mapDispatchToProps)(Phonebook);
