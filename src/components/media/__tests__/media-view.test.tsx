import renderer from '../../../testing/renderer';
import MediaView from '../media-view';
import context from '../../../conferencing/global-context';

describe('MediaView', () => {
  const setup = renderer(MediaView, {
    getDefaultProps: () => ({
      audioTrackId: null,
      videoTrackId: null,
    }),
  });

  function setVideoRef(
    output: ReturnType<typeof setup>['output'],
    ref = { srcObject: null, play: jest.fn() },
  ) {
    const video = output.find({ 'data-test-id': 'video-stream' }).getElement();
    (video as any).ref(ref);

    return ref;
  }

  it('shows the current video stream', () => {
    const { output } = setup();
    const ref = setVideoRef(output);

    expect(ref.srcObject).toBeInstanceOf(MediaStream);
  });

  it('survives while unmounting', () => {
    const { output } = setup();
    const pass = () => setVideoRef(output, null);

    expect(pass).not.toThrow();
  });

  it('binds tracks to the media stream', () => {
    const audioTrack = new MediaStreamTrack();
    const videoTrack = new MediaStreamTrack();
    context.tracks.set('a-id', audioTrack);
    context.tracks.set('v-id', videoTrack);

    const { output } = setup({
      audioTrackId: 'a-id',
      videoTrackId: 'v-id',
    });

    const ref = setVideoRef(output);

    expect(ref.srcObject.getTracks()).toContain(audioTrack);
    expect(ref.srcObject.getTracks()).toContain(videoTrack);
  });

  it('removes tracks that are no longer needed', () => {
    const audioTrack = new MediaStreamTrack();
    context.tracks.set('a-id', audioTrack);
    context.tracks.set('v-id', new MediaStreamTrack());

    const { output } = setup({
      audioTrackId: 'a-id',
      videoTrackId: 'v-id',
    });

    const ref = setVideoRef(output);
    output.setProps({ videoTrackId: null });

    expect(ref.srcObject.getTracks()).toHaveLength(1);
    expect(ref.play).toHaveBeenCalled();
  });
});
