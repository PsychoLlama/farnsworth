import { createStore, applyMiddleware } from 'redux';
import initialState, { State } from '../../../reducers/initial-state';
import { middleware } from '../track-sync';
import * as trackEffects from '../../../effects/tracks';

jest.mock('../../../effects/tracks');

describe('Send Track Middleware', () => {
  function setup() {
    function reducer(state: State = initialState) {
      return state;
    }

    const store = createStore(reducer, applyMiddleware(middleware));

    return {
      store,
    };
  }

  it('sends local tracks after a dispatch', () => {
    const { store } = setup();

    store.dispatch({ type: 'unknown' });

    expect(trackEffects.sendLocalTracksToAllParticipants).toHaveBeenCalledWith(
      store.getState(),
    );
  });
});
