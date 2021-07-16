import React from 'react';
import styled from 'styled-components';
import { FiMic, FiVideo, FiMenu } from 'react-icons/fi';
import * as css from '../../utils/css';

export default class Controls extends React.Component {
  render() {
    return (
      <Container>
        <Control>
          <FiMic />
        </Control>

        <Control>
          <FiVideo />
        </Control>

        <Control>
          <FiMenu />
        </Control>
      </Container>
    );
  }
}

const Container = styled.div`
  background-color: ${css.color('background')};
  border-radius: ${css.radius};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Control = styled.button`
  appearance: none;
  border: none;
  color: ${css.color('primary')};
  background-color: transparent;
  padding: 0;
  margin: 0;
  font-size: 1.5rem;
  padding: 1rem;

  :first-child {
    border-radius: ${css.radius} 0 0 ${css.radius};
  }

  :last-child {
    margin-right: 0;
    border-radius: 0 ${css.radius} ${css.radius} 0;
  }

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
