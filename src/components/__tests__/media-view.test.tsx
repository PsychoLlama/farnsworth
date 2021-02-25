import renderer from '../../testing/renderer';
import MediaView from '../media-view';

describe('MediaView', () => {
  const setup = renderer(MediaView, {
    getDefaultProps: () => ({
      audioTrackId: null,
      videoTrackId: null,
    }),
  });

  it('renders', () => {
    expect(setup).not.toThrow();
  });
});
