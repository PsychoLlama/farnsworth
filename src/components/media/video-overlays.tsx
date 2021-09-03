import { FiUser } from 'react-icons/fi';
import React from 'react';
import styled from 'styled-components';
import * as css from '../../utils/css';

const Center = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
`;

// Icon style template
const Icon = styled.span`
  border-radius: 50%;
  background-color: ${css.color('background')};
  color: ${css.color('foreground')};
  font-size: 2rem;
  padding: 1rem;
`;

export function NoVideoTrack() {
  return (
    <Center>
      <Icon as={FiUser} />
    </Center>
  );
}
