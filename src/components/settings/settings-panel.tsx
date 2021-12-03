import { DeviceInfo } from 'media-devices';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import { State } from '../../reducers/initial-state';
import * as css from '../../utils/css';
import * as actions from '../../actions';
import { TrackKind, MY_PARTICIPANT_ID } from '../../utils/constants';
import AdvancedSettings from './advanced-settings';

export class SettingsPanel extends React.Component<Props> {
  audioInputId = uuid();
  videoInputId = uuid();

  render() {
    const {
      panelId,
      audioSources,
      videoSources,
      selectedAudioDeviceId,
      selectedVideoDeviceId,
    } = this.props;

    return (
      <Container id={panelId}>
        <InputGroup>
          <InputTitle htmlFor={this.audioInputId}>Audio devices</InputTitle>
          <Dropdown
            data-test="choose-audio-source"
            id={this.audioInputId}
            disabled={audioSources.length === 0}
            onChange={this.chooseAudioTrack}
            value={selectedAudioDeviceId}
          >
            {this.props.audioSources.map(this.renderAudioOption)}
          </Dropdown>
        </InputGroup>

        <InputGroup>
          <InputTitle htmlFor={this.videoInputId}>Video devices</InputTitle>
          <Dropdown
            data-test="choose-video-source"
            id={this.videoInputId}
            disabled={videoSources.length === 0}
            onChange={this.chooseVideoTrack}
            value={selectedVideoDeviceId}
          >
            {this.props.videoSources.map(this.renderVideoOption)}
          </Dropdown>
        </InputGroup>

        <AdvancedSettings />
      </Container>
    );
  }

  createRenderer = (kind: TrackKind) => (device: DeviceInfo) => {
    return (
      <option
        value={device.deviceId}
        key={device.deviceId}
        data-test={`${kind}-source-option`}
      >
        {device.label}
      </option>
    );
  };

  renderVideoOption = this.createRenderer(TrackKind.Video);
  renderAudioOption = this.createRenderer(TrackKind.Audio);

  buildTrackQuery =
    (kind: TrackKind) => (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.currentTarget;

      this.props.changeDevice({
        [kind]: { deviceId: { exact: value } },
      });
    };

  chooseAudioTrack = this.buildTrackQuery(TrackKind.Audio);
  chooseVideoTrack = this.buildTrackQuery(TrackKind.Video);
}

interface Props {
  changeDevice: typeof actions.devices.requestMediaDevices;
  audioSources: Array<DeviceInfo>;
  videoSources: Array<DeviceInfo>;
  selectedAudioDeviceId: string;
  selectedVideoDeviceId: string;
  panelId: string;
}

const Container = styled.div`
  display: grid;
  grid-row-gap: 2rem;
  max-width: 315px;
  padding: 1rem;
  box-sizing: border-box;

  @media screen and (max-width: ${css.breakpoint.mobile}) {
    max-width: none;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const InputTitle = styled.label`
  width: max-content;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

// Hold my beer.
const Dropdown = styled.select`
  appearance: none;
  border-radius: ${css.radius};
  border: 1px solid ${css.color('foreground')};
  background-color: ${css.color('background')};
  box-sizing: border-box;
  padding: 0.5rem 0.25rem;
  color: ${css.color('text')};
  font-size: 85%;

  :hover:not(:disabled),
  :focus:not(:disabled) {
    border-color: ${css.color('primary')};
    outline: none;
  }

  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export function mapStateToProps(state: State) {
  const { audio, video } = state.sources.available;

  const localTracksByDeviceId = state.participants[MY_PARTICIPANT_ID].trackIds
    .map((id) => state.tracks[id])
    .reduce((tracks, track) => {
      tracks.set(track.deviceId, track);
      return tracks;
    }, new Map());

  const selectedAudioDeviceId =
    audio.find((device) => localTracksByDeviceId.has(device.deviceId))
      ?.deviceId ?? '';

  const selectedVideoDeviceId =
    video.find((device) => localTracksByDeviceId.has(device.deviceId))
      ?.deviceId ?? '';

  return {
    audioSources: audio,
    videoSources: video,
    activeTracks: state.participants[MY_PARTICIPANT_ID].trackIds,
    selectedAudioDeviceId,
    selectedVideoDeviceId,
  };
}

const mapDispatchToProps = {
  changeDevice: actions.devices.requestMediaDevices,
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPanel);
