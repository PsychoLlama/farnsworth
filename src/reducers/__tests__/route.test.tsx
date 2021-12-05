import setup from '../../testing/redux';

describe('Route reducer', () => {
  describe('change', () => {
    it('changes the route', () => {
      const { store, sdk } = setup();

      const route = { id: '/path/:id', pathName: '/path/id', params: {} };
      sdk.route.change(route);

      expect(store.getState().route).toBe(route);
    });
  });
});
