import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { State } from '../reducers/initial-state';

export class Phonebook extends React.Component<Props> {
  render() {
    if (this.props.isOpen === false) {
      return null;
    }

    return <Container>TODO: copy invite link</Container>;
  }
}

interface Props {
  isOpen: boolean;
}

const Container = styled.aside.attrs({ role: 'complementary' })`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  max-width: 20rem;
`;

export function mapStateToProps(state: State) {
  return {
    isOpen: state.phonebook.open,
  };
}

export default connect(mapStateToProps)(Phonebook);
