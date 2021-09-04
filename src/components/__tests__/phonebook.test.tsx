import renderer from '../../testing/renderer';
import { Phonebook, mapStateToProps } from '../phonebook';
import createStore from '../../utils/create-store';

describe('Phonebook', () => {
  const setup = renderer(Phonebook, {
    getDefaultProps: () => ({
      isOpen: true,
    }),
  });

  it('only shows itself when the phonebook is open', () => {
    const { output: closed } = setup({ isOpen: false });
    const { output: open } = setup({ isOpen: true });

    expect(closed.equals(null)).toBe(true);
    expect(open.equals(null)).toBe(false);
  });

  describe('mapStateToProps', () => {
    it('grabs the correct props', () => {
      const store = createStore();
      const props = mapStateToProps(store.getState());

      expect(props).toMatchInlineSnapshot(`
        Object {
          "isOpen": false,
        }
      `);
    });
  });
});
