import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { MockMediaStream, MockMediaStreamTrack } from './mocks/media';
import { MockRTCPeerConnection } from './mocks/webrtc';

Enzyme.configure({
  adapter: new Adapter(),
});

Object.assign(global, {
  MediaStream: MockMediaStream,
  MediaStreamTrack: MockMediaStreamTrack,
  RTCPeerConnection: MockRTCPeerConnection,
});
