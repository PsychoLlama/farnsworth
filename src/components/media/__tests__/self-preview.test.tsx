import renderer from '../../../testing/renderer';
import SelfPreview from '../self-preview';

describe('SelfPreview', () => {
  const setup = renderer(SelfPreview, {
    getDefaultProps: () => ({}),
  });

  it('renders', () => {
    expect(setup).not.toThrow();
  });
});
