import renderer from '../../testing/renderer';
import Sidebar from '../sidebar';

describe('Sidebar', () => {
  const setup = renderer(Sidebar, {
    getDefaultProps: () => ({}),
  });

  it('renders', () => {
    expect(setup).not.toThrow();
  });
});
