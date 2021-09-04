import React from 'react';
import styled from 'styled-components';
import Participant from './participant';
import { MY_PARTICIPANT_ID } from '../../utils/constants';
import Controls from './controls';
import Phonebook from '../phonebook';

export default class SelfPreview extends React.Component {
  render() {
    return (
      <FullScreen>
        <Row>
          <Participant id={MY_PARTICIPANT_ID} />
          <Phonebook />
        </Row>
        <Controls />
      </FullScreen>
    );
  }
}

const FullScreen = styled.main.attrs({ role: 'main' })`
  max-height: 100vh;
  max-width: 100%;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-grow: 1;
  overflow: hidden;
`;
