import renderer from '../../../testing/renderer';
import TextInput from '../text-input';

describe('TextInput', () => {
  const setup = renderer(TextInput, {
    getDefaultProps: () => ({}),
  });

  it('renders', () => {
    expect(setup).not.toThrow();
  });
});
