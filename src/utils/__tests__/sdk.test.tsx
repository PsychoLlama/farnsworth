import sdk, { createSdk } from '../sdk';
import store from '../redux-store';

jest.spyOn(store, 'dispatch');

describe('SDK', () => {
  beforeEach(() => {
    (store as any).dispatch.mockClear();
  });

  it('passes basic sanity checks', () => {
    expect(Object.keys(sdk).length).toBeGreaterThan(0);
    expect(sdk).toMatchObject({
      devices: expect.any(Object),
      connections: expect.any(Object),
    });
  });

  it('binds actions to dispatch', () => {
    expect(store.dispatch).not.toHaveBeenCalled();
    createSdk().phonebook.toggle();
    expect(store.dispatch).toHaveBeenCalled();
  });
});
