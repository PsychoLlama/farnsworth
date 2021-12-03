import Switch from '../switch';
import renderer from '../../../testing/renderer';

describe('Switch', () => {
  const setup = renderer(Switch, {
    getDefaultProps: () => ({
      children: 'Defensive forcefield',
      value: true,
    }),
  });

  it('renders', () => {
    expect(setup).not.toThrow();
  });
});
