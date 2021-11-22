import renderer from '../../../testing/renderer';
import MediaView from '../media-view';
import context from '../../../conferencing/global-context';
import * as Overlays from '../video-overlays';

describe('MediaView', () => {
  const setup = renderer(MediaView, {
    getDefaultProps: () => ({
      audioTrackId: null,
      videoTrackId: null,
      isLocal: false,
    }),
  });

  async function setVideoRef(
    output: ReturnType<typeof setup>['output'],
    ref = { srcObject: null, play: jest.fn() },
  ) {
    const video = output.find({ 'data-test-id': 'video-stream' }).getElement();
    await (video as any).ref(ref);

    return ref;
  }

  it('shows the current video stream', async () => {
    const { output } = setup();
    const ref = await setVideoRef(output);

    expect(ref.srcObject).toBeInstanceOf(MediaStream);
  });

  it('survives while unmounting', async () => {
    const { output } = setup();

    await expect(setVideoRef(output, null)).resolves.not.toThrow();
  });

  it('binds tracks to the media stream', async () => {
    const audioTrack = new MediaStreamTrack();
    const videoTrack = new MediaStreamTrack();
    context.tracks.set('a-id', audioTrack);
    context.tracks.set('v-id', videoTrack);

    const { output } = setup({
      audioTrackId: 'a-id',
      videoTrackId: 'v-id',
    });

    const ref = await setVideoRef(output);

    expect(ref.srcObject.getTracks()).toContain(audioTrack);
    expect(ref.srcObject.getTracks()).toContain(videoTrack);
  });

  it('removes tracks that are no longer needed', async () => {
    const audioTrack = new MediaStreamTrack();
    context.tracks.set('a-id', audioTrack);
    context.tracks.set('v-id', new MediaStreamTrack());

    const { output } = setup({
      audioTrackId: 'a-id',
      videoTrackId: 'v-id',
    });

    const ref = await setVideoRef(output);
    output.setProps({ videoTrackId: null });

    expect(ref.srcObject.getTracks()).toHaveLength(1);
    expect(ref.play).toHaveBeenCalled();
  });

  it('resets the media stream when the video track is removed', async () => {
    context.tracks.set('a-id', new MediaStreamTrack());
    context.tracks.set('v-id', new MediaStreamTrack());

    const { output } = setup({
      audioTrackId: null,
      videoTrackId: null,
    });

    const ref = await setVideoRef(output);
    const original = ref.srcObject;

    // No change with audio.
    output.setProps({ audioTrackId: 'a-id' });
    expect(ref.srcObject).toBe(original);
    output.setProps({ audioTrackId: null });
    expect(ref.srcObject).toBe(original);

    output.setProps({ videoTrackId: 'v-id' });
    expect(ref.srcObject).not.toBe(original);
  });

  it('does not try to play when there are no tracks', async () => {
    const { output } = setup({
      audioTrackId: null,
      videoTrackId: null,
    });

    const ref = await setVideoRef(output);

    expect(ref.play).not.toHaveBeenCalled();
  });

  it('survives even if .play() throws', async () => {
    context.tracks.set('v-id', new MediaStreamTrack());
    const { output } = setup({
      audioTrackId: null,
      videoTrackId: 'v-id',
    });

    const promise = setVideoRef(output, {
      srcObject: new MediaStream(),
      play: jest.fn(() => {
        throw new Error('Simulating permission error');
      }),
    });

    await expect(promise).resolves.not.toThrow();
  });

  it('only adds audio tracks to remote streams', async () => {
    const audioTrack = new MediaStreamTrack();
    context.tracks.set('a-id', audioTrack);
    context.tracks.set('v-id', new MediaStreamTrack());

    const { output } = setup({
      audioTrackId: 'a-id',
      videoTrackId: 'v-id',
      isLocal: true,
    });

    const ref = await setVideoRef(output);

    expect(ref.srcObject.getTracks()).not.toContain(audioTrack);
  });

  it('shows a placeholder without a video track', () => {
    const { output: without } = setup();
    const { output: withVideo } = setup({ videoTrackId: 'v-id' });

    expect(without.find(Overlays.NoVideoTrack).exists()).toBe(true);
    expect(withVideo.find(Overlays.NoVideoTrack).exists()).toBe(false);
  });
});
