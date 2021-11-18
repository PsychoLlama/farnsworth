import renderer from '../../testing/renderer';
import { Phonebook } from '../phonebook';

describe('Phonebook', () => {
  const setup = renderer(Phonebook, {
    getDefaultProps: () => ({
      // Imperative action creator - not worth adding correct types here.
      dial: jest.fn() as any,
    }),
  });

  it('keeps track of the invite input state', () => {
    const { findByTestId } = setup();
    const value = '/invite/code';

    findByTestId('invite-code-input').simulate('change', value);
    expect(findByTestId('invite-code-input').prop('value')).toBe(value);

    findByTestId('invite-code-form').simulate('submit', new Event('submit'));

    // Input should be cleared.
    expect(findByTestId('invite-code-input').prop('value')).toBe('');
  });

  it('dials the remote peer', () => {
    const { findByTestId, props } = setup();

    findByTestId('invite-code-input').simulate('change', '/remote');
    findByTestId('invite-code-form').simulate('submit', new Event('submit'));

    expect(props.dial).toHaveBeenCalledWith('/remote');
  });
});
