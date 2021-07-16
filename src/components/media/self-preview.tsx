import React from 'react';
import styled from 'styled-components';
import Participant from './participant';
import { MY_PARTICIPANT_ID } from '../../utils/constants';
import Controls from './controls';

export default class SelfPreview extends React.Component {
  render() {
    return (
      <FullScreen>
        <Participant id={MY_PARTICIPANT_ID} />
        <ControlsOverlay>
          <Controls />
        </ControlsOverlay>
      </FullScreen>
    );
  }
}

const FullScreen = styled.div`
  max-height: 100vh;
  display: flex;
  flex-grow: 1;
`;

const ControlsOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 2rem;
`;
