import renderer from '../../testing/renderer';
import Statusbar from '../statusbar';

describe('Statusbar', () => {
  const setup = renderer(Statusbar, {
    getDefaultProps: () => ({}),
  });

  it('renders', () => {
    expect(setup).not.toThrow();
  });
});
