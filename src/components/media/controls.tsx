import React from 'react';
import styled from 'styled-components';
import { FiMic, FiVideo, FiUsers, FiMicOff, FiVideoOff } from 'react-icons/fi';
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
    const { togglePhonebook, micEnabled, camEnabled, micTrackId, camTrackId } =
      this.props;

    return (
      <Container>
        <ControlGroup data-left />

        <ControlGroup>
          <Control
            data-test="toggle-audio"
            onClick={this.toggleAudio}
            disabled={!micTrackId}
          >
            {micEnabled ? <FiMic /> : <FiMicOff />}
          </Control>

          <Control
            data-test="toggle-video"
            onClick={this.toggleVideo}
            disabled={!camTrackId}
          >
            {camEnabled ? <FiVideo /> : <FiVideoOff />}
          </Control>
        </ControlGroup>

        <ControlGroup data-right>
          <Control data-test="toggle-phonebook" onClick={togglePhonebook}>
            <FiUsers />
          </Control>
        </ControlGroup>
      </Container>
    );
  }

  toggleAudio = () => {
    const { micEnabled, micTrackId } = this.props;

    if (micEnabled) {
      this.props.pauseTrack({ trackId: micTrackId, kind: TrackKind.Audio });
    } else {
      this.props.resumeTrack({ trackId: micTrackId, kind: TrackKind.Audio });
    }
  };

  toggleVideo = () => {
    const { camEnabled, camTrackId } = this.props;

    if (camEnabled) {
      this.props.pauseTrack({ trackId: camTrackId, kind: TrackKind.Video });
    } else {
      this.props.resumeTrack({ trackId: camTrackId, kind: TrackKind.Video });
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
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
`;

const ControlGroup = styled.div`
  display: flex;
  justify-content: center;

  &[data-left] {
    justify-content: flex-start;
  }

  &[data-right] {
    justify-content: flex-end;
  }
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

  :disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
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
