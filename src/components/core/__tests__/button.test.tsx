import renderer from '../../../testing/renderer';
import * as Button from '../button';

describe('Button', () => {
  it.each([
    ['base', Button.Base],
    ['primary', Button.Primary],
  ])('renders %s', (_, Component) => {
    const setup = renderer(Component, {
      getDefaultProps: () => ({}),
    });

    expect(setup).not.toThrow();
  });
});
