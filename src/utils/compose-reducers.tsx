/* eslint-disable @typescript-eslint/no-explicit-any */
import { Action } from 'redux';
import { State } from '../reducers/initial-state';

/**
 * Disclaimer: this might be a bad idea.
 *
 * This utility combines top-level reducers into a single function that can be
 * given to redux. It simplifies the act of managing relational state (e.g.
 * `state.tracks` with pointers from `state.participants`) by giving access to
 * both in the same reducer, a task which previously required data input from
 * the action creator.
 */
export default function composeReducers(reducers: Array<Reducer>) {
  return function aggregateReducer(state: State, action: Action<any>) {
    return reducers.reduce((state, reducer) => reducer(state, action), state);
  };
}

interface Reducer {
  (state: State, action: Action<any>): State;
}
