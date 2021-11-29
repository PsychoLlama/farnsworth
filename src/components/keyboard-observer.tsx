import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { State } from '../reducers/initial-state';
import { TrackKind, MY_PARTICIPANT_ID } from '../utils/constants';

export class KeyboardObserver extends React.Component<Props> {
  componentDidMount() {
    document.body.addEventListener('keydown', this.checkForKeybinding);
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.checkForKeybinding);
  }

  render() {
    return this.props.children;
  }

  checkForKeybinding = (event: KeyboardEvent) => {
    const code = [
      event.metaKey && 'meta',
      event.ctrlKey && 'ctrl',
      event.altKey && 'alt',
      event.shiftKey && 'shift',
      event.key,
    ]
      .filter(Boolean)
      .join('+');

    if (this.keybindings.has(code)) {
      event.preventDefault();
      this.keybindings.get(code)();
    }
  };

  toggleMic = () => {
    this.props.toggleTrack({
      trackId: this.props.audioTrackId,
      kind: TrackKind.Audio,
    });
  };

  toggleCam = () => {
    this.props.toggleTrack({
      trackId: this.props.videoTrackId,
      kind: TrackKind.Video,
    });
  };

  keybindings = new Map([
    ['ctrl+e', this.toggleCam],
    ['ctrl+d', this.toggleMic],
  ]);
}

interface Props {
  toggleTrack: typeof actions.tracks.toggle;
  children?: React.ReactNode;
  audioTrackId: null | string;
  videoTrackId: null | string;
}

export function mapStateToProps(state: State) {
  const participant = state.participants[MY_PARTICIPANT_ID];

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

const mapDispatchToProps = {
  toggleTrack: actions.tracks.toggle,
};

export default connect(mapStateToProps, mapDispatchToProps)(KeyboardObserver);
