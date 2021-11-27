import createStore from '../../utils/create-store';
import * as actions from '../../actions';

describe('Route reducer', () => {
  describe('change()', () => {
    it('changes the route', () => {
      const store = createStore();

      const route = { id: '/path/:id', pathName: '/path/id', params: {} };
      store.dispatch(actions.route.change(route));

      expect(store.getState().route).toBe(route);
    });
  });
});
