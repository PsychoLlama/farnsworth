import renderer from '../../testing/renderer';
import { Phonebook } from '../phonebook';
import createStore from '../../utils/create-store';

describe('Phonebook', () => {
  const setup = renderer(Phonebook, {
    getDefaultProps: () => ({}),
  });

  it('renders', () => {
    expect(setup).not.toThrow();
  });
});
