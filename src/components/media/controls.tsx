import React from 'react';
import styled from 'styled-components';
import {
  FiMic,
  FiVideo,
  FiUsers,
  FiMicOff,
  FiVideoOff,
  FiPhone,
  FiAirplay,
  FiSliders,
  FiMessageSquare,
} from 'react-icons/fi';
import { connect } from 'react-redux';
import * as css from '../../utils/css';
import * as actions from '../../actions';
import { Button } from '../core';
import { State } from '../../reducers/initial-state';
import {
  MY_PARTICIPANT_ID,
  TrackKind,
  TrackSource,
} from '../../utils/constants';

export class Controls extends React.Component<Props> {
  static defaultProps = {
    supportsScreenSharing: 'getDisplayMedia' in Object(navigator.mediaDevices),
    micTrackId: null,
    camTrackId: null,
  };

  render() {
    const {
      togglePhonebook,
      micEnabled,
      camEnabled,
      micTrackId,
      camTrackId,
      activeCall,
      unreadMessages,
      sharingScreen,
      supportsScreenSharing,
    } = this.props;

    return (
      <Container>
        <ControlGroup data-left>
          <Control
            data-test="toggle-settings"
            onClick={this.props.toggleSettings}
          >
            <FiSliders />
          </Control>

          {activeCall && (
            <Control
              data-test="toggle-chat"
              onClick={this.props.toggleChat}
              data-unread={unreadMessages}
            >
              <FiMessageSquare />
            </Control>
          )}
        </ControlGroup>

        <ControlGroup>
          <Control
            data-test="toggle-audio"
            onClick={this.toggleAudio}
            disabled={!micTrackId}
          >
            {micEnabled ? <FiMic /> : <FiMicOff />}
          </Control>

          {activeCall && (
            <Control data-test="leave-call" onClick={this.endCall}>
              <EndCallIcon />
            </Control>
          )}

          <Control
            data-test="toggle-video"
            onClick={this.toggleVideo}
            disabled={!camTrackId}
          >
            {camEnabled ? <FiVideo /> : <FiVideoOff />}
          </Control>
        </ControlGroup>

        <ControlGroup data-right>
          {supportsScreenSharing && (
            <Control
              data-test="toggle-screen-share"
              data-sharing={sharingScreen}
              onClick={this.toggleScreenShare}
            >
              <FiAirplay />
            </Control>
          )}

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

  toggleScreenShare = () => {
    if (this.props.sharingScreen) {
      this.props.stopSharingScreen();
    } else {
      this.props.shareScreen();
    }
  };

  endCall = () => {
    this.props.leaveCall(this.props.activeCall);
  };
}

interface Props {
  togglePhonebook: typeof actions.phonebook.toggle;
  toggleSettings: typeof actions.settings.toggle;
  shareScreen: typeof actions.devices.shareScreen;
  stopSharingScreen: typeof actions.devices.stopSharingScreen;
  toggleChat: typeof actions.chat.toggle;
  pauseTrack: typeof actions.tracks.pause;
  resumeTrack: typeof actions.tracks.resume;
  leaveCall: typeof actions.call.leave;
  supportsScreenSharing: boolean;
  sharingScreen: boolean;
  activeCall: null | string;
  micTrackId: null | string;
  camTrackId: null | string;
  micEnabled: boolean;
  camEnabled: boolean;
  unreadMessages: boolean;
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
  position: relative;

  :hover,
  :focus {
    background-color: rgba(0, 0, 0, 0.5);

    @media (prefers-color-scheme: light) {
      background-color: ${css.color('foreground')};
      color: ${css.color('background')};
    }
  }

  :active {
    filter: brightness(70%);
  }

  :disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  &[data-unread='true']::after {
    content: ' ';
    display: block;
    border-radius: 50%;
    width: 10px;
    height: 10px;
    background-color: ${css.color('secondary')};
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }

  &[data-sharing='true'] {
    color: ${css.color('primary')};

    :hover,
    :focus {
      color: ${css.color('background')};
      background-color: ${css.color('primary')};
    }
  }
`;

const EndCallIcon = styled(FiPhone)`
  color: ${css.color('secondary')};
  transform: rotate(135deg);
  transform-origin: center;
`;

const mapDispatchToProps = {
  togglePhonebook: actions.phonebook.toggle,
  toggleSettings: actions.settings.toggle,
  leaveCall: actions.call.leave,
  shareScreen: actions.devices.shareScreen,
  stopSharingScreen: actions.devices.stopSharingScreen,
  toggleChat: actions.chat.toggle,
  pauseTrack: actions.tracks.pause,
  resumeTrack: actions.tracks.resume,
};

export function mapStateToProps(state: State) {
  const participant = state.participants[MY_PARTICIPANT_ID];

  const query = (kind: TrackKind) => (id: string) => {
    const track = state.tracks[id];
    return track.kind === kind && track.source === TrackSource.Device;
  };

  const micTrackId = participant.trackIds.find(query(TrackKind.Audio));
  const camTrackId = participant.trackIds.find(query(TrackKind.Video));

  const camEnabled = state.tracks[camTrackId]?.enabled ?? false;
  const micEnabled = state.tracks[micTrackId]?.enabled ?? false;

  const sharingScreen = Object.values(state.tracks).some((track) => {
    return track.local && track.source === TrackSource.Display;
  });

  return {
    activeCall: state.call?.peerId ?? null,
    unreadMessages: state.chat.unreadMessages,
    sharingScreen,
    micTrackId,
    micEnabled,
    camTrackId,
    camEnabled,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
