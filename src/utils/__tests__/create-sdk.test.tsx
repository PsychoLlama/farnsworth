import createSdk from '../create-sdk';
import createStore from '../create-store';

describe('SDK', () => {
  it('binds actions to dispatch', () => {
    const store = createStore();
    jest.spyOn(store, 'dispatch');

    createSdk(store).panel.toggle();
    expect(store.dispatch).toHaveBeenCalled();
  });
});
