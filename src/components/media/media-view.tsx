import React from 'react';
import styled from 'styled-components';
import context from '../../conferencing/global-context';
import * as Overlays from './video-overlays';
import Logger from '../../utils/logger';

const logger = new Logger('<MediaView>');

export default class MediaView extends React.Component<Props> {
  stream = new MediaStream();
  videoRef: null | HTMLVideoElement = null;

  componentDidUpdate(prevProps: Props) {
    // When you remove a video track from a media stream, the video freezes on
    // the last frame. You need a new stream to clear it out.
    if (prevProps.videoTrackId !== this.props.videoTrackId) {
      this.stream = new MediaStream();
      this.videoRef.srcObject = this.stream;
    }

    this.syncTracksToMediaStream();
  }

  render() {
    return (
      <Container>
        <VideoStream
          data-local={this.props.isLocal}
          ref={this.attachMediaStream}
          data-test-id="video-stream"
          tabIndex={-1}
        />
        {this.renderOverlay()}
      </Container>
    );
  }

  renderOverlay = () => {
    const { videoTrackId } = this.props;

    return <Overlay>{videoTrackId ? null : <Overlays.NoVideoTrack />}</Overlay>;
  };

  attachMediaStream = async (video: null | HTMLVideoElement) => {
    if (video) video.srcObject = this.stream;
    this.videoRef = video;

    await this.syncTracksToMediaStream();
  };

  // Ensures the media stream has the tracks described by props, and only
  // those tracks. Any extras will be removed.
  syncTracksToMediaStream = async () => {
    const { audioTrackId, videoTrackId } = this.props;
    const trackIds = [audioTrackId, videoTrackId].filter(this.supportsTrack);
    const tracks = trackIds.map((trackId) => context.tracks.get(trackId));
    tracks.forEach((track) => this.stream.addTrack(track));

    // TODO: See if Chrome still kills audio tracks when video is paused.
    this.stream.getTracks().forEach((track) => {
      if (!tracks.includes(track)) this.stream.removeTrack(track);
    });

    // Only call `.play()` if you have something to play.
    if (this.videoRef && tracks.length) {
      try {
        await this.videoRef.play();
      } catch (error) {
        // Typically this happens due to autoplay policy. Usually browsers
        // give us a pass after the first successful `getUserMedia(...)`.
        // Unless you're seeing a bug, it should be safe to ignore.
        logger.warn('Could not play stream:', error.message);
      }
    }
  };

  supportsTrack = (trackId: string) => {
    const { isLocal, audioTrackId } = this.props;

    if (!trackId) return false;

    // Filter out your own audio track from local streams. It's distracting.
    return isLocal ? trackId !== audioTrackId : true;
  };
}

interface Props {
  audioTrackId: null | string;
  videoTrackId: null | string;
  isLocal: boolean;
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
