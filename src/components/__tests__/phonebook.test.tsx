import renderer from '../../testing/renderer';
import { Phonebook } from '../phonebook';

describe('Phonebook', () => {
  const setup = renderer(Phonebook, {
    getDefaultProps: () => ({}),
  });

  it('keeps track of the invite input state', () => {
    const { findByTestId } = setup();
    const value = '/invite/link';

    findByTestId('invite-link-input').simulate('change', value);
    expect(findByTestId('invite-link-input').prop('value')).toBe(value);

    const event = new Event('submit');
    findByTestId('invite-link-form').simulate('submit', event);

    // Input should be cleared.
    expect(findByTestId('invite-link-input').prop('value')).toBe('');
  });
});
