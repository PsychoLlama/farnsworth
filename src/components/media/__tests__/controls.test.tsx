import renderer from '../../../testing/renderer';
import { Controls } from '../controls';

describe('Controls', () => {
  const setup = renderer(Controls, {
    getDefaultProps: () => ({
      togglePhonebook: jest.fn(),
    }),
  });

  it('opens the phonebook when the control is clicked', () => {
    const { output, props } = setup();

    output.find('[data-test="toggle-phonebook"]').simulate('click');

    expect(props.togglePhonebook).toHaveBeenCalled();
  });
});
