import React from 'react';
import styled from 'styled-components';
import context from '../../conferencing/global-context';

export default class MediaView extends React.Component<Props> {
  stream = new MediaStream();
  videoRef: null | HTMLVideoElement = null;

  componentDidMount() {
    this.syncTracksToMediaStream();
  }

  componentDidUpdate() {
    this.syncTracksToMediaStream();
  }

  render() {
    return (
      <VideoStream
        data-local={this.props.isLocal}
        ref={this.attachMediaStream}
        data-test-id="video-stream"
      />
    );
  }

  attachMediaStream = (video: null | HTMLVideoElement) => {
    if (video) video.srcObject = this.stream;
    this.videoRef = video;
  };

  // Ensures the media stream has the tracks described by props, and only
  // those tracks. Any extras will be removed.
  syncTracksToMediaStream = () => {
    const { audioTrackId, videoTrackId } = this.props;
    const trackIds = [audioTrackId, videoTrackId].filter(this.supportsTrack);
    const tracks = trackIds.map((trackId) => context.tracks.get(trackId));
    tracks.forEach((track) => this.stream.addTrack(track));

    this.stream.getTracks().forEach((track) => {
      if (!tracks.includes(track)) this.stream.removeTrack(track);
    });

    if (this.videoRef) this.videoRef.play();
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

const VideoStream = styled.video`
  object-fit: cover;
  object-position: center;
  flex-grow: 1;

  // People are used to seeing their own faces in a mirror. Replicate the
  // effect for local video streams.
  &[data-local='true'] {
    transform: rotateY(180deg);
  }
`;
