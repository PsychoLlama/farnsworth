import produce from 'immer';
import composeReducers from '../compose-reducers';
import initialState, { State } from '../../reducers/initial-state';

describe('composeReducers', () => {
  it('returns state when the reducers list is empty', () => {
    const reducer = composeReducers([]);

    expect(reducer(initialState, { type: 'unknown' })).toBe(initialState);
  });

  it('applies each reducer to state', () => {
    function r1(state: State) {
      return produce(state, (draft) => {
        draft.phonebook.open = true;
      });
    }

    function r2(state: State) {
      return produce(state, (draft) => {
        draft.chat.open = true;
      });
    }

    const reducer = composeReducers([r1, r2]);

    expect(reducer(initialState, { type: 'any' })).toMatchObject({
      phonebook: { open: true },
      chat: { open: true },
    });
  });
});
