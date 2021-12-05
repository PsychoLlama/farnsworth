import setup from '../../testing/redux';

describe('Tool actions', () => {
  describe('patch', () => {
    it('patches state', () => {
      const { store, sdk } = setup();

      sdk.tools.patch((state) => {
        state.phonebook.open = true;
      });

      expect(store.getState().phonebook).toHaveProperty('open', true);
    });
  });
});
