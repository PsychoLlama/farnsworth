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
        <Controls />
      </FullScreen>
    );
  }
}

const FullScreen = styled.div`
  max-height: 100vh;
  max-width: 100%;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`;
