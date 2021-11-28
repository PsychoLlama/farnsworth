import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { State } from '../reducers/initial-state';
import Phonebook from './phonebook';
import * as css from '../utils/css';

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
      <Overlay>
        <Child />
      </Overlay>
    );
  }
}

interface Props {
  view: View;
}

const Overlay = styled.div.attrs({ role: 'dialog' })`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: ${css.color('overlay')};
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
