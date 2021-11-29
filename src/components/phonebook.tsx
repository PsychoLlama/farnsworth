import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { FiClipboard, FiCheck } from 'react-icons/fi';
import { Button } from './core';
import { State as ReduxState } from '../reducers/initial-state';
import debounce from '../utils/debounce';
import * as css from '../utils/css';

export class Phonebook extends React.Component<Props, State> {
  state = {
    showCopySuccessMessage: false,
  };

  componentWillUnmount() {
    this.scheduleNoticeDismissal.clear();
  }

  render() {
    const { showCopySuccessMessage } = this.state;

    return (
      <Container>
        <Instructions>
          Share this URL with the person you&apos;re trying to call.
        </Instructions>

        <InputGroup>
          <Input
            data-test="invite-code"
            value={this.getInviteUrl()}
            onFocus={this.selectAll}
            readOnly
          />

          <CopyButton
            data-success={showCopySuccessMessage}
            data-test="copy-invite-code"
            onClick={this.copy}
          >
            {showCopySuccessMessage ? (
              <FiCheck data-test="icon-success" aria-label="Copied" />
            ) : (
              <FiClipboard
                data-test="icon-inactive"
                aria-label="Copy to clipboard"
              />
            )}
          </CopyButton>
        </InputGroup>
      </Container>
    );
  }

  getInviteUrl = () => {
    return new URL(`#/call/${this.props.localId}`, location.origin).toString();
  };

  selectAll = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  };

  copy = async () => {
    const inviteUrl = this.getInviteUrl();
    await navigator.clipboard.writeText(inviteUrl);
    this.setState({ showCopySuccessMessage: true });
    this.scheduleNoticeDismissal();
  };

  scheduleNoticeDismissal = debounce(2000, () => {
    this.setState({ showCopySuccessMessage: false });
  });
}

interface Props {
  localId: string;
}

interface State {
  showCopySuccessMessage: boolean;
}

const Container = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
`;

const Instructions = styled.p`
  padding: 0;
  margin: 0;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 0.5rem 0.5rem;
  margin: 0;
  border-radius: ${css.radius} 0 0 ${css.radius};
  border: 1px solid ${css.color('foreground')};
  background-color: ${css.color('background')};
  color: ${css.color('text')};
  max-width: 30rem;
  border-right: none;
  box-sizing: border-box;

  :focus,
  :hover {
    border: 1px solid ${css.color('primary')};
    border-right: none;
    outline: none;
  }
`;

const CopyButton = styled(Button.Base)`
  background-color: ${css.color('background')};
  color: ${css.color('background')};
  border: 1px solid ${css.color('foreground')};
  border-radius: 0 ${css.radius} ${css.radius} 0;
  padding: 0 0.5rem;
  background-color: ${css.color('white')};

  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  :focus,
  :hover {
    border-color: ${css.color('primary')};
    outline: none;
  }

  &[data-success='true'] {
    background-color: ${css.color('tertiary')};
    color: white;
  }
`;

const InputGroup = styled.div`
  display: flex;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 30rem;
`;

export function mapStateToProps({ relay }: ReduxState) {
  return {
    localId: relay?.localId ?? '',
  };
}

export default connect(mapStateToProps)(Phonebook);
