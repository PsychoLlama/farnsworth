import { v4 as uuid } from 'uuid';
import EventEmitter from 'events';
import { TrackKind } from '../../utils/constants';

export class MockMediaStream extends EventEmitter implements MediaStream {
  _tracks: Set<MockMediaStreamTrack> = new Set();

  // --- implemented ---
  id = uuid();
  active = true;
  addEventListener = this.on;
  removeEventListener = this.off;
  addTrack = jest.fn(this._tracks.add.bind(this._tracks));
  removeTrack = jest.fn(this._tracks.delete.bind(this._tracks));
  getTracks = () => Array.from(this._tracks);

  getAudioTracks() {
    return this.getTracks().filter((track) => track.kind === TrackKind.Audio);
  }

  getVideoTracks() {
    return this.getTracks().filter((track) => track.kind === TrackKind.Video);
  }

  // --- unimplemented ---
  dispatchEvent = jest.fn();
  onaddtrack = null;
  onremovetrack = null;
  clone = jest.fn();
  getTrackById = jest.fn();
}

export class MockMediaStreamTrack
  extends EventEmitter
  implements MediaStreamTrack
{
  _deviceId = uuid();

  // --- implemented ---
  id = uuid();
  enabled = true;
  addEventListener = this.on;
  removeEventListener = this.off;
  kind = TrackKind.Audio;
  muted = false;
  isolated = false;
  readyState = 'live' as const;
  stop = jest.fn();
  label = '';
  contentHint = '';

  getSettings = jest.fn(() => ({
    deviceId: this._deviceId,
    width: 640,
    height: 480,
  }));

  // --- unimplemented ---
  clone = jest.fn();
  applyConstraints = jest.fn();
  getConstraints = jest.fn();
  getCapabilities = jest.fn();
  dispatchEvent = jest.fn();
  onended = null;
  onmute = null;
  onunmute = null;
  onisolationchange = null;
}

export class MockMediaStreamTrackEvent
  extends Event
  implements MediaStreamTrackEvent
{
  constructor(type: string, init: MediaStreamTrackEventInit) {
    super(type, init);
    this.track = init.track;
  }

  track = null;
}
