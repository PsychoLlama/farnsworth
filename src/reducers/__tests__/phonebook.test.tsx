import setup from '../../testing/redux';

describe('Participants reducer', () => {
  describe('open()', () => {
    it('opens the phonebook', async () => {
      const { store, sdk } = setup();

      await sdk.phonebook.open();
      const { phonebook } = store.getState();

      expect(phonebook).toHaveProperty('open', true);
    });
  });

  describe('close()', () => {
    it('closes the phonebook', async () => {
      const { store, sdk } = setup();

      await sdk.phonebook.open();
      await sdk.phonebook.close();
      const { phonebook } = store.getState();

      expect(phonebook).toHaveProperty('open', false);
    });
  });

  describe('toggle()', () => {
    it('opens and closes the phonebook', async () => {
      const { store, sdk } = setup();

      await sdk.phonebook.toggle();
      expect(store.getState().phonebook).toHaveProperty('open', true);

      await sdk.phonebook.toggle();
      expect(store.getState().phonebook).toHaveProperty('open', false);
    });
  });
});
