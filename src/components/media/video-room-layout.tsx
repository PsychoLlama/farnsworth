import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import selector from '../../utils/selector';
import { State } from '../../reducers/initial-state';
import Participant from './participant';
import Controls from './controls';
import Phonebook from '../phonebook';
import { MY_PARTICIPANT_ID, TrackSource } from '../../utils/constants';
import * as css from '../../utils/css';
import ChatPanel from '../chat';

export class VideoRoomLayout extends React.Component<Props> {
  render() {
    const { participantIds } = this.props;

    return (
      <FullScreen>
        <Column>
          <Row>
            <VideoLayout>
              {participantIds.length > 1 ? (
                this.renderMeetingRoom()
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

  renderMeetingRoom = () => {
    const { participantIds, showRemoteDisplay } = this.props;
    const [otherPeer] = participantIds.filter((id) => id !== MY_PARTICIPANT_ID);

    return showRemoteDisplay ? (
      <>
        <Participant id={otherPeer} sourceType={TrackSource.Display} />
        <FloatingVideo>
          <Participant id={MY_PARTICIPANT_ID} />
          <Participant id={otherPeer} />
        </FloatingVideo>
      </>
    ) : (
      <>
        <Participant id={otherPeer} />
        <FloatingVideo>
          <Participant id={MY_PARTICIPANT_ID} />
        </FloatingVideo>
      </>
    );
  };
}

interface Props {
  participantIds: Array<string>;
  showRemoteDisplay: boolean;
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
  transition: opacity 100ms ease-out;

  :hover {
    opacity: 0.25;
  }
`;

const getParticipantIds = selector(Object.keys);

export function mapStateToProps(state: State) {
  const showRemoteDisplay = Object.values(state.tracks).some((track) => {
    return track.source === TrackSource.Display && !track.local;
  });

  return {
    participantIds: getParticipantIds(state.participants),
    showRemoteDisplay,
  };
}

export default connect(mapStateToProps)(VideoRoomLayout);
