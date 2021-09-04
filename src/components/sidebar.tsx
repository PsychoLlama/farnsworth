import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { State } from '../reducers/initial-state';
import Phonebook from './phonebook';

export class Sidebar extends React.Component<Props> {
  views = {
    [View.Phonebook]: Phonebook,
    [View.None]: () => null,
  };

  render() {
    if (this.props.view === View.None) {
      return null;
    }

    const Child = this.views[this.props.view];

    return (
      <Container>
        <Child />
      </Container>
    );
  }
}

interface Props {
  view: View;
}

const Container = styled.aside.attrs({ role: 'complementary' })`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  max-width: 20rem;
`;

export enum View {
  Phonebook = 'phonebook',
  None = 'none',
}

export function mapStateToProps(state: State) {
  return {
    view: state.phonebook.open ? View.Phonebook : View.None,
  };
}

export default connect(mapStateToProps)(Sidebar);
