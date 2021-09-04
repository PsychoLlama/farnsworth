import renderer from '../../testing/renderer';
import { Sidebar, View, mapStateToProps } from '../sidebar';
import createStore from '../../utils/create-store';
import * as actions from '../../actions';

describe('Sidebar', () => {
  const setup = renderer(Sidebar, {
    getDefaultProps: () => ({
      view: View.None,
    }),
  });

  it('only shows itself when the phonebook is open', () => {
    const { output: closed } = setup({ view: View.None });
    const { output: open } = setup({ view: View.Phonebook });

    expect(closed.equals(null)).toBe(true);
    expect(open.equals(null)).toBe(false);
  });

  describe('mapStateToProps', () => {
    it('defaults to an empty view', () => {
      const store = createStore();
      const props = mapStateToProps(store.getState());

      expect(props).toMatchInlineSnapshot(`
        Object {
          "view": "none",
        }
      `);
    });

    it('shows the phonebook when the flag is set', async () => {
      const store = createStore();
      await store.dispatch(actions.phonebook.open());
      const props = mapStateToProps(store.getState());

      expect(props.view).toBe(View.Phonebook);
    });
  });
});
