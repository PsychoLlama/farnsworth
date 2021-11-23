import React from 'react';
import styled from 'styled-components';
import { FiMic, FiVideo, FiUsers, FiSliders } from 'react-icons/fi';
import { connect } from 'react-redux';
import * as css from '../../utils/css';
import * as actions from '../../actions';
import { Button } from '../core';
import { State } from '../../reducers/initial-state';
import { MY_PARTICIPANT_ID, TrackKind } from '../../utils/constants';

export class Controls extends React.Component<Props> {
  render() {
    const { togglePhonebook } = this.props;

    return (
      <Container>
        <Control>
          <FiSliders />
        </Control>

        <Control data-test="toggle-audio" onClick={this.toggleAudio}>
          <FiMic />
        </Control>

        <Control data-test="toggle-video" onClick={this.toggleVideo}>
          <FiVideo />
        </Control>

        <Control data-test="toggle-phonebook" onClick={togglePhonebook}>
          <FiUsers />
        </Control>
      </Container>
    );
  }

  toggleAudio = () => {
    this.props.toggleTrack(this.props.micTrackId);
  };

  toggleVideo = () => {
    this.props.toggleTrack(this.props.camTrackId);
  };
}

interface Props {
  togglePhonebook: typeof actions.phonebook.toggle;
  toggleTrack: typeof actions.tracks.toggle;
  micTrackId: null | string;
  camTrackId: null | string;
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
  toggleTrack: actions.tracks.toggle,
};

export function mapStateToProps(state: State) {
  const participant = state.participants[MY_PARTICIPANT_ID];

  // This feature does not make sense for screen sharing. It seems safe to
  // assume we're dealing with local hardware.
  return {
    micTrackId: participant.trackIds.find((id) => {
      return state.tracks[id].kind === TrackKind.Audio;
    }),
    camTrackId: participant.trackIds.find((id) => {
      return state.tracks[id].kind === TrackKind.Video;
    }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
