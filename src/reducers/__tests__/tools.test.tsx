import createStore from '../../utils/create-store';
import * as actions from '../../actions';

describe('Tool actions', () => {
  describe('patch', () => {
    it('patches state', () => {
      const store = createStore();
      store.dispatch(
        actions.tools.patch((state) => {
          state.chat.open = true;
        }),
      );

      expect(store.getState().chat).toHaveProperty('open', true);
    });
  });
});
