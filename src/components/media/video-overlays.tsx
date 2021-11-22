import { FiUser, FiPhoneCall, FiMeh } from 'react-icons/fi';
import React from 'react';
import styled from 'styled-components';
import * as css from '../../utils/css';

const Center = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Description = styled.p`
  font-style: italic;

  // Always on a black background.
  color: ${css.color('white')};
`;

const IconContainer = styled.div`
  background-color: ${css.color('background')};
  color: ${css.color('foreground')};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
  overflow: hidden;
`;

// Icon style template
const Icon = styled.span`
  font-size: 2rem;
  padding: 1rem;
`;

export function Connecting() {
  return (
    <Center>
      <IconContainer>
        <Icon as={FiPhoneCall} />
      </IconContainer>
      <Description>Connecting...</Description>
    </Center>
  );
}

export function Disconnected() {
  return (
    <Center>
      <IconContainer>
        <Icon as={FiMeh} />
      </IconContainer>
      <Description>They gone.</Description>
    </Center>
  );
}

export function NoVideoTrack() {
  return (
    <Center>
      <IconContainer>
        <Icon as={FiUser} />
      </IconContainer>
    </Center>
  );
}
