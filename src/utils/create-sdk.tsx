import { bindActionCreators, Store } from 'redux';
import * as actions from '../actions';
import { State } from '../reducers/initial-state';

/**
 * Wraps all actions in `dispatch()`. This is useful because conferencing
 * events (e.g. "new track" or "audio disabled") trigger outside React
 * components, without `connect()` to handle the binding.
 *
 * This enables conferencing logic to emit events without coupling to Redux.
 */
export default function createSdk(reduxStore: Store<State>): SDK {
  return Object.entries(actions).reduce(
    (sdk, [name, creators]) => ({
      ...sdk,
      [name]: bindActionCreators(creators, reduxStore.dispatch),
    }),
    {} as SDK,
  );
}

// Same signature, just wrapped with `dispatch()`.
type SDK = typeof actions;
