import React from 'react';
import styled from 'styled-components';
import { FiMic, FiVideo, FiUsers, FiSliders } from 'react-icons/fi';
import { connect } from 'react-redux';
import * as css from '../../utils/css';
import * as actions from '../../actions';

export class Controls extends React.Component<Props> {
  render() {
    const { togglePhonebook } = this.props;

    return (
      <Container>
        <Control>
          <FiSliders />
        </Control>

        <Control>
          <FiMic />
        </Control>

        <Control>
          <FiVideo />
        </Control>

        <Control data-test="toggle-phonebook" onClick={togglePhonebook}>
          <FiUsers />
        </Control>
      </Container>
    );
  }
}

interface Props {
  togglePhonebook: typeof actions.phonebook.toggle;
}

const Container = styled.div`
  background-color: ${css.color('background')};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
`;

const Control = styled.button`
  appearance: none;
  border: none;
  color: ${css.color('text')};
  background-color: transparent;
  padding: 0;
  margin: 0;
  font-size: 1.5rem;
  padding: 1rem;

  :hover,
  :focus {
    background-color: ${css.color('primary')};
    color: ${css.color('background')};
  }

  :active {
    background-color: ${css.color('background')};
    color: ${css.color('text')};
  }
`;

const mapDispatchToProps = {
  togglePhonebook: actions.phonebook.toggle,
};

export default connect(null, mapDispatchToProps)(Controls);
