import { DeviceInfo } from 'media-devices';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import { State } from '../../reducers/initial-state';
import * as css from '../../utils/css';

export class SettingsPanel extends React.Component<Props> {
  audioInputId = uuid();
  videoInputId = uuid();

  render() {
    const { audioSources, videoSources } = this.props;

    return (
      <Container>
        <InputGroup>
          <InputTitle htmlFor={this.audioInputId}>Audio devices</InputTitle>
          <Dropdown
            data-test="choose-audio-source"
            id={this.audioInputId}
            disabled={audioSources.length === 0}
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
          >
            {this.props.videoSources.map(this.renderVideoOption)}
          </Dropdown>
        </InputGroup>
      </Container>
    );
  }

  renderAudioOption = (device: DeviceInfo) => {
    return (
      <option key={this.getId(device)} data-test="audio-source-option">
        {device.label}
      </option>
    );
  };

  renderVideoOption = (device: DeviceInfo) => {
    return (
      <option key={this.getId(device)} data-test="video-source-option">
        {device.label}
      </option>
    );
  };

  getId = (device: DeviceInfo) => {
    return `${device.groupId}:${device.deviceId}`;
  };
}

interface Props {
  audioSources: Array<DeviceInfo>;
  videoSources: Array<DeviceInfo>;
}

const Container = styled.div`
  display: grid;
  grid-row-gap: 2rem;
  padding: 1rem;
  max-width: 315px;

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
  return {
    audioSources: state.sources.available.audio,
    videoSources: state.sources.available.video,
  };
}

export default connect(mapStateToProps)(SettingsPanel);
