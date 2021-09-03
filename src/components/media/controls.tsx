import React from 'react';
import styled from 'styled-components';
import { FiMic, FiVideo, FiUsers, FiSliders } from 'react-icons/fi';
import * as css from '../../utils/css';

export default class Controls extends React.Component {
  render() {
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

        <Control>
          <FiUsers />
        </Control>
      </Container>
    );
  }
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
