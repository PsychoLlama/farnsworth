import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { TextEncoder, TextDecoder } from 'util';
import {
  MockMediaStream,
  MockMediaStreamTrack,
  MockMediaStreamTrackEvent,
} from './mocks/media';
import { MockRTCPeerConnection } from './mocks/webrtc';

Enzyme.configure({
  adapter: new Adapter(),
});

Object.assign(global, {
  MediaStream: MockMediaStream,
  MediaStreamTrack: MockMediaStreamTrack,
  MediaStreamTrackEvent: MockMediaStreamTrackEvent,
  RTCPeerConnection: MockRTCPeerConnection,

  // Necessary for `multiaddr`. Can remove once Node v14 is dead.
  TextEncoder,
  TextDecoder,
});
