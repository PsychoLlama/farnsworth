import React from 'react';
import styled from 'styled-components';
import Participant from './participant';
import { MY_PARTICIPANT_ID } from '../../utils/constants';

export default class SelfPreview extends React.Component {
  render() {
    return (
      <FullScreen>
        <Participant id={MY_PARTICIPANT_ID} />
      </FullScreen>
    );
  }
}

const FullScreen = styled.div`
  max-height: 100vh;
  display: flex;
  flex-grow: 1;
`;
