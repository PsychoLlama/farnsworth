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
      <VideoStream ref={this.attachMediaStream} data-test-id="video-stream" />
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
    const trackIds = [audioTrackId, videoTrackId].filter(Boolean);
    const tracks = trackIds.map((trackId) => context.tracks.get(trackId));
    tracks.forEach((track) => this.stream.addTrack(track));

    this.stream.getTracks().forEach((track) => {
      if (!tracks.includes(track)) this.stream.removeTrack(track);
    });

    if (this.videoRef) this.videoRef.play();
  };
}

const VideoStream = styled.video`
  // TODO
`;

interface Props {
  audioTrackId: null | string;
  videoTrackId: null | string;
}
