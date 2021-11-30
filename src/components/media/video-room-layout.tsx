import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import selector from '../../utils/selector';
import { State } from '../../reducers/initial-state';
import Participant from './participant';
import Controls from './controls';
import Phonebook from '../phonebook';
import { MY_PARTICIPANT_ID } from '../../utils/constants';
import * as css from '../../utils/css';
import ChatPanel from '../chat';

export class VideoRoomLayout extends React.Component<Props> {
  render() {
    const { participantIds } = this.props;
    const [otherPeer] = participantIds.filter((id) => id !== MY_PARTICIPANT_ID);

    return (
      <FullScreen>
        <Column>
          <Row>
            <VideoLayout>
              {otherPeer ? (
                <>
                  <Participant id={otherPeer} />
                  <FloatingVideo>
                    <Participant id={MY_PARTICIPANT_ID} />
                  </FloatingVideo>
                </>
              ) : (
                <Participant id={MY_PARTICIPANT_ID} />
              )}
              <Phonebook />
            </VideoLayout>
            <ChatPanel />
          </Row>
          <Controls />
        </Column>
      </FullScreen>
    );
  }
}

interface Props {
  participantIds: Array<string>;
}

const FullScreen = styled.main.attrs({ role: 'main' })`
  max-height: 100vh;
  max-width: 100%;
  display: flex;
  flex-grow: 1;
`;

const Column = styled.div`
  display: flex;
  flex-grow: 1;
  overflow: hidden;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-grow: 1;
  overflow: hidden;
  position: relative;

  // Used for <ChatPanel> stack order.
  flex-direction: row-reverse;
`;

const VideoLayout = styled.div`
  display: flex;
  flex-grow: 1;
  overflow: hidden;
  position: relative;
`;

const FloatingVideo = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 15rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 1px solid ${css.color('background')};
  max-width: 30%;
`;

const getParticipantIds = selector(Object.keys);

export function mapStateToProps(state: State) {
  return {
    participantIds: getParticipantIds(state.participants),
  };
}

export default connect(mapStateToProps)(VideoRoomLayout);
