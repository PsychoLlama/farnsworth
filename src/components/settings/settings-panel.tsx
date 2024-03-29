import { DeviceInfo } from 'media-devices';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import { State as ReduxState } from '../../reducers/initial-state';
import * as css from '../../utils/css';
import * as actions from '../../actions';
import { TrackKind, MY_PARTICIPANT_ID } from '../../utils/constants';
import AdvancedSettings from './advanced-settings';
import IceServer from './ice-server';
import { Dropdown } from '../core';

const NO_DEVICE_SELECTED = 'no-device-selected';

export class SettingsPanel extends React.Component<Props, State> {
  state = { activeIceServerEditId: null };
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

    if (this.state.activeIceServerEditId !== null) {
      return (
        <IceServer
          onClose={this.finishEditingIceServer}
          id={this.state.activeIceServerEditId}
          data-test="edit-ice-server"
        />
      );
    }

    return (
      <Container id={panelId}>
        <InputGroup>
          <InputTitle htmlFor={this.videoInputId}>Cameras</InputTitle>
          <Dropdown
            data-test="choose-video-source"
            id={this.videoInputId}
            disabled={videoSources.length === 0}
            onChange={this.chooseVideoTrack}
            value={selectedVideoDeviceId}
          >
            <option value={NO_DEVICE_SELECTED} disabled>
              Choose a camera
            </option>

            {this.props.videoSources.map(this.renderVideoOption)}
          </Dropdown>
        </InputGroup>

        <InputGroup>
          <InputTitle htmlFor={this.audioInputId}>Microphones</InputTitle>
          <Dropdown
            data-test="choose-audio-source"
            id={this.audioInputId}
            disabled={audioSources.length === 0}
            onChange={this.chooseAudioTrack}
            value={selectedAudioDeviceId}
          >
            <option value={NO_DEVICE_SELECTED} disabled>
              Choose a microphone
            </option>
            {this.props.audioSources.map(this.renderAudioOption)}
          </Dropdown>
        </InputGroup>

        <AdvancedSettings
          data-test="advanced-settings"
          onEditIceServer={this.showIceServer}
        />
      </Container>
    );
  }

  showIceServer = ({ id }) => {
    this.setState({ activeIceServerEditId: id });
  };

  finishEditingIceServer = () => {
    this.setState({ activeIceServerEditId: null });
  };

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

interface State {
  activeIceServerEditId: null | number;
}

const Container = styled.div`
  display: grid;
  grid-row-gap: 2rem;
  grid-auto-rows: max-content;
  padding: 1rem;
  box-sizing: border-box;
  overflow: auto;
  flex-grow: 1;

  @media screen and (max-width: ${css.breakpoint.mobile}) {
    max-width: 100%;
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

export function mapStateToProps(state: ReduxState) {
  const { audio, video } = state.sources.available;

  const localTracksByDeviceId = state.participants[MY_PARTICIPANT_ID].trackIds
    .map((id) => state.tracks[id])
    .reduce((tracks, track) => {
      tracks.set(track.deviceId, track);
      return tracks;
    }, new Map());

  const selectedAudioDeviceId =
    audio.find((device) => localTracksByDeviceId.has(device.deviceId))
      ?.deviceId ?? NO_DEVICE_SELECTED;

  const selectedVideoDeviceId =
    video.find((device) => localTracksByDeviceId.has(device.deviceId))
      ?.deviceId ?? NO_DEVICE_SELECTED;

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
