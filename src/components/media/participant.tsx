import React from 'react';
import { connect } from 'react-redux';
import assert from '../../utils/assert';
import { State } from '../../reducers/initial-state';
import { TrackKind } from '../../utils/constants';
import MediaView from './media-view';
import { MY_PARTICIPANT_ID, ConnectionState } from '../../utils/constants';

export class Participant extends React.Component<Props> {
  render() {
    const { audioTrackId, videoTrackId, connectionState } = this.props;

    return (
      <MediaView
        isLocal={this.props.id === MY_PARTICIPANT_ID}
        audioTrackId={audioTrackId}
        videoTrackId={videoTrackId}
        connectionState={connectionState}
      />
    );
  }
}

interface Props extends OwnProps {
  audioTrackId: null | string;
  videoTrackId: null | string;
  connectionState: ConnectionState;
}

interface OwnProps {
  id: string;
}

export function mapStateToProps(state: State, { id }: { id: string }) {
  const participant = state.participants[id];
  assert(participant, 'Bad participant ID.');

  const audioTrackId = participant.trackIds.find((trackId) => {
    return state.tracks[trackId].kind === TrackKind.Audio;
  });

  const videoTrackId = participant.trackIds.find((trackId) => {
    return state.tracks[trackId].kind === TrackKind.Video;
  });

  return {
    audioTrackId: audioTrackId || null,
    videoTrackId: videoTrackId || null,
    connectionState: participant.connection.state,
  };
}

export default connect(mapStateToProps)(Participant);
