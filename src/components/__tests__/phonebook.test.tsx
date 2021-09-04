import renderer from '../../testing/renderer';
import { Phonebook } from '../phonebook';

describe('Phonebook', () => {
  const setup = renderer(Phonebook, {
    getDefaultProps: () => ({}),
  });

  it('keeps track of the invite input state', () => {
    const { findByTestId } = setup();
    const value = '/invite/code';

    findByTestId('invite-code-input').simulate('change', value);
    expect(findByTestId('invite-code-input').prop('value')).toBe(value);

    const event = new Event('submit');
    findByTestId('invite-code-form').simulate('submit', event);

    // Input should be cleared.
    expect(findByTestId('invite-code-input').prop('value')).toBe('');
  });
});
