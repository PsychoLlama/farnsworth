import renderer from '../../../testing/renderer';
import { NoVideoTrack, Connecting, Disconnected } from '../video-overlays';

describe('Video overlays', () => {
  it.each([[NoVideoTrack], [Connecting], [Disconnected]])(
    'successfully renders',
    (Overlay) => {
      const setup = renderer(Overlay, {
        getDefaultProps: () => ({}),
      });

      expect(setup).not.toThrow();
    },
  );
});
