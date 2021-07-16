import renderer from '../../../testing/renderer';
import Controls from '../controls';

describe('Controls', () => {
  const setup = renderer(Controls, {
    getDefaultProps: () => ({}),
  });

  it('renders', () => {
    expect(setup).not.toThrow();
  });
});
