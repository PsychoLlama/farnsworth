import { produce } from 'immer';
import renderer from '../../../testing/renderer';
import { MediaView, mapStateToProps } from '../media-view';
import context from '../../../conferencing/global-context';
import * as Overlays from '../video-overlays';
import {
  ConnectionState,
  TrackKind,
  TrackSource,
} from '../../../utils/constants';
import initialState, { State } from '../../../reducers/initial-state';

describe('MediaView', () => {
  beforeEach(() => {
    context.tracks.clear();
    context.tracks.set('a-id', new MediaStreamTrack());
    context.tracks.set('v-id', new MediaStreamTrack());
  });

  const setup = renderer(MediaView, {
    getDefaultProps: () => ({
      audioTrackId: null,
      videoTrackId: null,
      videoEnabled: true,
      isLocal: false,
      connectionState: ConnectionState.Connected,
    }),
  });

  function setVideoRef(
    output: ReturnType<typeof setup>['output'],
    ref = { srcObject: null, play: jest.fn() },
  ) {
    const video = output.find({ 'data-test': 'video-stream' }).getElement();
    (video as any).ref(ref);

    return ref;
  }

  it('shows the current video stream', () => {
    const { output } = setup({ videoTrackId: 'v-id' });
    const ref = setVideoRef(output);

    expect(ref.srcObject).toBeInstanceOf(MediaStream);
  });

  it('survives while unmounting', () => {
    const { output } = setup();

    const pass = () => setVideoRef(output, null);

    expect(pass).not.toThrow();
  });

  it('binds tracks to the media stream', () => {
    const audioTrack = context.tracks.get('a-id');
    const videoTrack = context.tracks.get('v-id');

    const { output } = setup({
      audioTrackId: 'a-id',
      videoTrackId: 'v-id',
    });

    const ref = setVideoRef(output);

    expect(ref.srcObject.getTracks()).toContain(audioTrack);
    expect(ref.srcObject.getTracks()).toContain(videoTrack);
  });

  it('removes tracks that are no longer needed', () => {
    const { output } = setup({
      audioTrackId: 'a-id',
      videoTrackId: 'v-id',
    });

    const ref = setVideoRef(output);
    output.setProps({ videoTrackId: null });

    expect(ref.srcObject.getTracks()).toHaveLength(1);
  });

  it('resets the video stream when video is disabled', () => {
    context.tracks.set('a-id-2', new MediaStreamTrack());

    const { output } = setup({
      audioTrackId: 'a-id',
      videoTrackId: 'v-id',
      videoEnabled: true,
    });

    const ref = setVideoRef(output);

    const original = ref.srcObject;
    output.setProps({ audioTrackId: 'a-id-2' });
    expect(ref.srcObject).toBe(original);
    output.setProps({ videoEnabled: false });
    expect(ref.srcObject).not.toBe(original);

    // Exclude paused video tracks.
    expect(ref.srcObject.getTracks()).toHaveLength(1);
  });

  it('resets the media stream when the video track changes', () => {
    const { output } = setup({
      audioTrackId: 'a-id',
      videoTrackId: null,
    });

    const ref = setVideoRef(output);
    const original = ref.srcObject;

    // No change with audio.
    output.setProps({ videoTrackId: 'v-id' });
    expect(ref.srcObject).toBe(original);
    output.setProps({ audioTrackId: null });
    expect(ref.srcObject).toBe(original);
    output.setProps({ audioTrackId: 'a-id' });
    expect(ref.srcObject).toBe(original);

    output.setProps({ videoTrackId: null });
    expect(ref.srcObject).not.toBe(original);
  });

  it('survives even if .play() throws', async () => {
    const { output, findByTestId } = setup({
      audioTrackId: null,
      videoTrackId: 'v-id',
    });

    setVideoRef(output, {
      srcObject: new MediaStream(),
      play: jest.fn(() => {
        throw new Error('Simulating permission error');
      }),
    });

    const { onCanPlay } = findByTestId('video-stream').props();

    await expect(onCanPlay()).resolves.not.toThrow();
  });

  it('only adds audio tracks to remote streams', () => {
    const { output } = setup({
      audioTrackId: 'a-id',
      videoTrackId: 'v-id',
      isLocal: true,
    });

    const ref = setVideoRef(output);

    const audioTrack = context.tracks.get('a-id');
    expect(ref.srcObject.getTracks()).not.toContain(audioTrack);
  });

  it('shows a placeholder without a video track', () => {
    const { output: without } = setup();
    const { output: withVideo } = setup({ videoTrackId: 'v-id' });

    expect(without.find(Overlays.NoVideoTrack).exists()).toBe(true);
    expect(withVideo.find(Overlays.NoVideoTrack).exists()).toBe(false);
  });

  it('shows a placeholder while the video track is disabled', () => {
    const { output } = setup({ videoTrackId: 'v-id' });

    expect(output.find(Overlays.NoVideoTrack).exists()).toBe(false);
    output.setProps({ videoEnabled: false });
    expect(output.find(Overlays.NoVideoTrack).exists()).toBe(true);
  });

  it('shows an overlay while connecting or disconnected', () => {
    const { output: connecting } = setup({
      connectionState: ConnectionState.Connecting,
    });

    const { output: disconnected } = setup({
      connectionState: ConnectionState.Disconnected,
    });

    expect(connecting.find(Overlays.Connecting).exists()).toBe(true);
    expect(disconnected.find(Overlays.Disconnected).exists()).toBe(true);
  });

  it('continues the connecting overlay until playback is ready', () => {
    const { output, findByTestId } = setup({
      connectionState: ConnectionState.Connected,
      videoTrackId: 'v-id',
    });

    expect(output.find(Overlays.Connecting).exists()).toBe(true);
    findByTestId('video-stream').simulate('play', new Event('play'));
    expect(output.find(Overlays.Connecting).exists()).toBe(false);
    findByTestId('video-stream').simulate('play', new Event('pause'));
    expect(output.find(Overlays.Connecting).exists()).toBe(true);
  });

  it('hides the connecting overlay for local video streams', () => {
    const { output } = setup({
      connectionState: ConnectionState.Connected,
      videoTrackId: 'v-id',
      isLocal: true,
    });

    expect(output.find(Overlays.Connecting).exists()).toBe(false);
  });

  it('only defines a media stream if there are tracks', () => {
    const { output } = setup({ audioTrackId: null, videoTrackId: null });

    const ref = setVideoRef(output);
    expect(ref.srcObject).toBeNull();

    // Component update: tracks added.
    output.setProps({ videoTrackId: 'v-id' });
    expect(ref.srcObject).toBeInstanceOf(MediaStream);

    // Component update: all tracks removed.
    output.setProps({ videoTrackId: null });
    expect(ref.srcObject).toBeNull();
  });

  describe('mapStateToProps', () => {
    function setup(patchState: (state: State) => void) {
      const state = produce(initialState, patchState);
      const props = mapStateToProps(state, {
        connectionState: ConnectionState.Connected,
        audioTrackId: null,
        videoTrackId: 'v-id',
        isLocal: false,
      });

      return {
        props,
        state,
      };
    }

    it('returns the expected props', () => {
      const { props } = setup((state) => {
        state.tracks['v-id'] = {
          kind: TrackKind.Video,
          source: TrackSource.Device,
          enabled: true,
          local: true,
        };
      });

      expect(props).toMatchInlineSnapshot(`
        Object {
          "videoEnabled": true,
        }
      `);
    });
  });
});
