import { createStore, applyMiddleware } from 'redux';
import { middleware, GET_STATE } from '../get-state';

describe('GET_STATE', () => {
  function setup() {
    const reducer = jest.fn((state: number, action) => {
      switch (action.type) {
        case 'increment':
          return state + 1;
        case 'decrement':
          return state - 1;
        default:
          return state;
      }
    });

    const store = createStore(reducer, 0, applyMiddleware(middleware));

    return {
      store,
      reducer,
    };
  }

  it('ignores dispatches that it should not care about', () => {
    const { store } = setup();

    store.dispatch({ type: 'increment' });
    store.dispatch({ type: 'increment' });
    store.dispatch({ type: 'decrement' });

    expect(store.getState()).toBe(1);
  });

  it('returns state without dispatching', () => {
    const { store, reducer } = setup();

    reducer.mockClear();
    const state = store.dispatch(GET_STATE);

    expect(state).toBe(store.getState());
    expect(reducer).toHaveBeenCalledTimes(0);
  });
});
