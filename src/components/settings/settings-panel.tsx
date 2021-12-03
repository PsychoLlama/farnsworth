import { DeviceInfo } from 'media-devices';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import { State } from '../../reducers/initial-state';
import * as css from '../../utils/css';
import * as actions from '../../actions';
import {
  TrackKind,
  MY_PARTICIPANT_ID,
  STUN_SERVERS,
} from '../../utils/constants';

export class SettingsPanel extends React.Component<Props> {
  audioInputId = uuid();
  videoInputId = uuid();
  forceTurnCheckboxId = uuid();

  render() {
    const {
      panelId,
      audioSources,
      videoSources,
      selectedAudioDeviceId,
      selectedVideoDeviceId,
      iceServers,
    } = this.props;

    const defaultIceServers = STUN_SERVERS.map((url) => ({
      urls: `stun:${url}`,
    }));

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

        <details
          data-test="advanced-settings"
          onToggle={this.loadSettingsWhenOpened}
          open
        >
          <Summary>Advanced settings</Summary>

          <Subtitle>ICE servers</Subtitle>

          <IceServers>
            {iceServers.concat(defaultIceServers).map(this.renderIceServer)}
          </IceServers>
        </details>
      </Container>
    );
  }

  loadSettingsWhenOpened = (
    event: React.SyntheticEvent<HTMLDetailsElement>,
  ) => {
    if (event.currentTarget.open) {
      this.props.loadSettings();
    }
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

  renderIceServer = (server: RTCIceServer, index: number) => {
    // Coerce all URLs to an array.
    const servers = [].concat(server.urls).map((addr) => {
      const [type, ...rest] = addr.split(':');
      const url = rest.join(':');
      return { type, url };
    });

    return (
      <React.Fragment key={index}>
        {servers.map((server) => (
          <li
            data-test="ice-server-address"
            key={`${index}:${server.type}:${server.url}`}
          >
            {server.url} ({server.type})
          </li>
        ))}
      </React.Fragment>
    );
  };
}

interface Props {
  changeDevice: typeof actions.devices.requestMediaDevices;
  loadSettings: typeof actions.settings.load;
  audioSources: Array<DeviceInfo>;
  videoSources: Array<DeviceInfo>;
  selectedAudioDeviceId: string;
  selectedVideoDeviceId: string;
  panelId: string;
  iceServers: State['settings']['iceServers'];
  forceTurnRelay: boolean;
  useDefaultIceServers: boolean;
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

const Summary = styled.summary`
  cursor: default;
`;

const Subtitle = styled.h3`
  margin: 0;
  margin-top: 1rem;
`;

const IceServers = styled.ol`
  display: grid;
  grid-row-gap: 0.5rem;
  margin: 0;
  padding: 1rem;
  list-style-type: disc;
  list-style-position: inside;
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

  const { useDefaultIceServers, forceTurnRelay, iceServers } = state.settings;

  return {
    audioSources: audio,
    videoSources: video,
    activeTracks: state.participants[MY_PARTICIPANT_ID].trackIds,
    selectedAudioDeviceId,
    selectedVideoDeviceId,
    useDefaultIceServers,
    forceTurnRelay,
    iceServers,
  };
}

const mapDispatchToProps = {
  changeDevice: actions.devices.requestMediaDevices,
  loadSettings: actions.settings.load,
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPanel);
