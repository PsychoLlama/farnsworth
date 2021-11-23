import React from 'react';
import styled from 'styled-components';
import {
  FiMic,
  FiVideo,
  FiUsers,
  FiSliders,
  FiMicOff,
  FiVideoOff,
} from 'react-icons/fi';
import { connect } from 'react-redux';
import * as css from '../../utils/css';
import * as actions from '../../actions';
import { Button } from '../core';
import { State } from '../../reducers/initial-state';
import { MY_PARTICIPANT_ID, TrackKind } from '../../utils/constants';

export class Controls extends React.Component<Props> {
  static defaultProps = {
    micTrackId: null,
    camTrackId: null,
  };

  render() {
    const { togglePhonebook, micEnabled, camEnabled } = this.props;

    return (
      <Container>
        <Control>
          <FiSliders />
        </Control>

        <Control data-test="toggle-audio" onClick={this.toggleAudio}>
          {micEnabled ? <FiMic /> : <FiMicOff />}
        </Control>

        <Control data-test="toggle-video" onClick={this.toggleVideo}>
          {camEnabled ? <FiVideo /> : <FiVideoOff />}
        </Control>

        <Control data-test="toggle-phonebook" onClick={togglePhonebook}>
          <FiUsers />
        </Control>
      </Container>
    );
  }

  toggleAudio = () => {
    const { micEnabled, micTrackId } = this.props;

    if (micEnabled) {
      this.props.pauseTrack(micTrackId);
    } else {
      this.props.resumeTrack(micTrackId);
    }
  };

  toggleVideo = () => {
    const { camEnabled, camTrackId } = this.props;

    if (camEnabled) {
      this.props.pauseTrack(camTrackId);
    } else {
      this.props.resumeTrack(camTrackId);
    }
  };
}

interface Props {
  togglePhonebook: typeof actions.phonebook.toggle;
  pauseTrack: typeof actions.tracks.pause;
  resumeTrack: typeof actions.tracks.resume;
  micTrackId: null | string;
  camTrackId: null | string;
  micEnabled: boolean;
  camEnabled: boolean;
}

const Container = styled.div`
  background-color: ${css.color('background')};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
`;

const Control = styled(Button.Base)`
  font-size: 1.5rem;
  padding: 1rem;

  :hover,
  :focus {
    background-color: ${css.color('foreground')};
    color: ${css.color('background')};
  }

  :active {
    filter: brightness(70%);
  }
`;

const mapDispatchToProps = {
  togglePhonebook: actions.phonebook.toggle,
  pauseTrack: actions.tracks.pause,
  resumeTrack: actions.tracks.resume,
};

export function mapStateToProps(state: State) {
  const participant = state.participants[MY_PARTICIPANT_ID];

  const micTrackId = participant.trackIds.find((id) => {
    return state.tracks[id].kind === TrackKind.Audio;
  });

  const camTrackId = participant.trackIds.find((id) => {
    return state.tracks[id].kind === TrackKind.Video;
  });

  const camEnabled = state.tracks[camTrackId]?.enabled ?? false;
  const micEnabled = state.tracks[micTrackId]?.enabled ?? false;

  return {
    micTrackId,
    micEnabled,
    camTrackId,
    camEnabled,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
