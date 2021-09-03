import renderer from '../../../testing/renderer';
import { NoVideoTrack } from '../video-overlays';

describe('Video overlays', () => {
  it.each([[NoVideoTrack]])('successfully renders', (Overlay) => {
    const setup = renderer(Overlay, {
      getDefaultProps: () => ({}),
    });

    expect(setup).not.toThrow();
  });
});
