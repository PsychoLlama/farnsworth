import React from 'react';
import { connect } from 'react-redux';
import invariant from 'invariant';
import { State } from '../reducers/initial-state';
import { TrackKind } from '../utils/constants';
import MediaView from './media-view';

export class Participant extends React.Component<Props> {
  render() {
    const { audioTrackId, videoTrackId } = this.props;

    return (
      <MediaView audioTrackId={audioTrackId} videoTrackId={videoTrackId} />
    );
  }
}

interface Props extends OwnProps {
  audioTrackId: null | string;
  videoTrackId: null | string;
}

interface OwnProps {
  id: string;
}

export function mapStateToProps(state: State, { id }: { id: string }) {
  const participant = state.participants[id];
  invariant(participant, 'Bad participant ID.');

  const audioTrackId = participant.trackIds.find((trackId) => {
    return state.tracks[trackId].kind === TrackKind.Audio;
  });

  const videoTrackId = participant.trackIds.find((trackId) => {
    return state.tracks[trackId].kind === TrackKind.Video;
  });

  return {
    audioTrackId: audioTrackId || null,
    videoTrackId: videoTrackId || null,
  };
}

export default connect(mapStateToProps)(Participant);
