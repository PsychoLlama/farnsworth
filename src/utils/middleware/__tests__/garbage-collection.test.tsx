import { applyMiddleware, createStore } from 'redux';
import { middleware } from '../garbage-collection';
import initialState, { State } from '../../../reducers/initial-state';
import * as effects from '../../../effects';

jest.mock('../../../effects');

describe('Garbage Collection Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function setup() {
    function reducer(state: State = initialState) {
      return state;
    }

    const store = createStore(reducer, applyMiddleware(middleware));

    return {
      store,
    };
  }

  it('does not interfere with actions or state', () => {
    const { store } = setup();

    const action = { type: 'unknown' };
    const result = store.dispatch(action);

    expect(result).toEqual(action);
    expect(store.getState()).toEqual(initialState);
  });

  it('runs the garbage collector after every dispatch', () => {
    const { store } = setup();

    store.dispatch({ type: 'hello, world' });

    expect(effects.gc.run).toHaveBeenCalled();
  });
});
