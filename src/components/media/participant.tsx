import React from 'react';
import { connect } from 'react-redux';
import assert from '../../utils/assert';
import { State } from '../../reducers/initial-state';
import { TrackKind, TrackSource } from '../../utils/constants';
import MediaView from './media-view';
import { MY_PARTICIPANT_ID, ConnectionState } from '../../utils/constants';

export class Participant extends React.Component<Props> {
  render() {
    const { audioTrackId, videoTrackId, connectionState, sourceType } =
      this.props;

    return (
      <MediaView
        isLocal={this.props.id === MY_PARTICIPANT_ID}
        audioTrackId={audioTrackId}
        videoTrackId={videoTrackId}
        connectionState={connectionState}
        sourceType={sourceType}
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
  sourceType?: TrackSource;
}

export function mapStateToProps(
  state: State,
  { id, sourceType = TrackSource.Device }: OwnProps,
) {
  const participant = state.participants[id];
  assert(participant, 'Bad participant ID.');

  const query = (kind: TrackKind) => (id: string) => {
    const track = state.tracks[id];
    return track.kind === kind && track.source === sourceType;
  };

  const audioTrackId = participant.trackIds.find(query(TrackKind.Audio));
  const videoTrackId = participant.trackIds.find(query(TrackKind.Video));

  return {
    audioTrackId: audioTrackId || null,
    videoTrackId: videoTrackId || null,
    connectionState: participant.connection.state,
  };
}

export default connect(mapStateToProps)(Participant);
