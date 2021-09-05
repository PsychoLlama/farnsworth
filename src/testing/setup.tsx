import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { TextEncoder, TextDecoder } from '@zxing/text-encoding';
import { MockMediaStream, MockMediaStreamTrack } from './mocks/media';
import { MockRTCPeerConnection } from './mocks/webrtc';

Enzyme.configure({
  adapter: new Adapter(),
});

Object.assign(global, {
  MediaStream: MockMediaStream,
  MediaStreamTrack: MockMediaStreamTrack,
  RTCPeerConnection: MockRTCPeerConnection,

  // Necessary for `multiaddr`. Can remove once Node v14 is dead.
  TextEncoder,
  TextDecoder,
});
