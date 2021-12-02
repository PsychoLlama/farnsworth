import produce from 'immer';
import { nothing } from 'retreon';
import createStore from '../utils/create-store';
import createSdk from '../utils/create-sdk';
import initialState, { State } from '../reducers/initial-state';

/**
 * Provides a simple mechanism for covering most reducer tests. It:
 *
 * - Creates a brand new redux store
 * - Optionally runs a function to initialize in a particular state
 * - Returns every action creator already dispatch-bound to the new store
 */
export default function setup(
  updateState?: (state: State) => void | State | typeof nothing,
) {
  const state = updateState ? produce(initialState, updateState) : initialState;
  const store = createStore(state);
  const sdk = createSdk(store);

  return { store, sdk };
}
