import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import context from '../../conferencing/global-context';
import * as Overlays from './video-overlays';
import Logger from '../../utils/logger';
import { ConnectionState } from '../../utils/constants';
import { State as ReduxState } from '../../reducers/initial-state';

const logger = new Logger('<MediaView>');

export class MediaView extends React.Component<Props, State> {
  stream = new MediaStream();
  videoRef: null | HTMLVideoElement = null;
  state = { playing: false };

  componentDidMount() {
    this.syncTracksToMediaStream();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.videoTrackId && !this.props.videoTrackId) {
      this.resetMediaStream();
    }

    if (prevProps.videoEnabled && !this.props.videoEnabled) {
      this.resetMediaStream();
    }

    this.syncTracksToMediaStream();
  }

  render() {
    return (
      <Container>
        <VideoStream
          data-local={this.props.isLocal}
          ref={this.attachMediaStream}
          onCanPlay={this.play}
          onPlay={this.syncPlayState}
          onPause={this.syncPlayState}
          data-test="video-stream"
          tabIndex={-1}
        />
        <Overlay>{this.renderOverlay()}</Overlay>
      </Container>
    );
  }

  syncPlayState = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    this.setState({ playing: event.type === 'play' });
  };

  renderOverlay = () => {
    const { videoTrackId, connectionState, isLocal, videoEnabled } = this.props;

    if (connectionState === ConnectionState.Connecting) {
      return <Overlays.Connecting />;
    }

    if (connectionState === ConnectionState.Disconnected) {
      return <Overlays.Disconnected />;
    }

    if (!videoTrackId || !videoEnabled) {
      return <Overlays.NoVideoTrack />;
    }

    if (!this.state.playing && !isLocal) {
      return <Overlays.Connecting />;
    }

    return null;
  };

  attachMediaStream = async (video: null | HTMLVideoElement) => {
    this.videoRef = video;
    this.bindStreamToVideo();
  };

  // Ensures the media stream has the tracks described by props, and only
  // those tracks. Any extras will be removed.
  syncTracksToMediaStream = () => {
    const { audioTrackId, videoTrackId } = this.props;
    const trackIds = [audioTrackId, videoTrackId].filter(this.supportsTrack);
    const tracks = trackIds.map((trackId) => context.tracks.get(trackId));
    tracks.forEach((track) => this.stream.addTrack(track));

    // TODO: See if Chrome still kills audio tracks when video is paused.
    this.stream.getTracks().forEach((track) => {
      if (!tracks.includes(track)) this.stream.removeTrack(track);
    });

    this.bindStreamToVideo();
  };

  supportsTrack = (trackId: string) => {
    const { isLocal, audioTrackId, videoTrackId, videoEnabled } = this.props;

    if (!trackId) return false;

    // Exclude paused video tracks. They briefly show a janky frozen frame.
    if (trackId === videoTrackId && !videoEnabled) return false;

    // Filter out your own audio track from local streams. It's distracting.
    return isLocal ? trackId !== audioTrackId : true;
  };

  // Chrome bug: if a <video> has an attached media stream before the first
  // `getUserMedia(...)` call, the permission prompt never shows, it just
  // hangs. That's why we only attach the stream when it has tracks.
  bindStreamToVideo = () => {
    const tracks = this.stream.getTracks();
    if (!this.videoRef) return;

    // At least one track was added.
    if (!this.videoRef.srcObject && tracks.length > 0) {
      this.videoRef.srcObject = this.stream;
    }

    // All tracks were removed.
    if (this.videoRef.srcObject && tracks.length === 0) {
      this.videoRef.srcObject = null;
    }
  };

  // When you remove a video track from a media stream, the video freezes on
  // the last frame. You need a new stream to clear it out.
  resetMediaStream = () => {
    if (!this.videoRef) return;

    this.stream = new MediaStream();
    this.videoRef.srcObject = null;
  };

  play = async () => {
    try {
      await this.videoRef.play();
    } catch (error) {
      // Typically this happens due to autoplay policy. Usually browsers
      // give us a pass after the first successful `getUserMedia(...)`.
      // Unless you're seeing a bug, it should be safe to ignore.
      logger.warn('Could not play stream:', error.message);
    }
  };
}

interface OwnProps {
  connectionState: ConnectionState;
  audioTrackId: null | string;
  videoTrackId: null | string;
  isLocal: boolean;
}

interface Props extends OwnProps {
  videoEnabled: boolean;
}

interface State {
  playing: boolean;
}

const Container = styled.div`
  display: flex;
  flex-grow: 1;
  position: relative;
  max-height: 100%;
  overflow: hidden;
  background-color: black;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-grow: 1;
`;

const VideoStream = styled.video`
  object-fit: cover;
  object-position: center;
  flex-grow: 1;
  overflow: hidden;

  // People are used to seeing their own faces in a mirror. Replicate the
  // effect for local video streams.
  &[data-local='true'] {
    transform: rotateY(180deg);
  }
`;

export function mapStateToProps(state: ReduxState, props: OwnProps) {
  return {
    videoEnabled: state.tracks[props.videoTrackId]?.enabled ?? false,
  };
}

export default connect(mapStateToProps)(MediaView);
