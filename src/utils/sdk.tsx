import { bindActionCreators } from 'redux';
import * as actions from '../actions';
import store from './redux-store';

/**
 * Wraps all actions in `dispatch()`. This is useful because conferencing
 * events (e.g. "new track" or "audio disabled") trigger outside React
 * components, without `connect()` to handle the binding.
 *
 * This enables conferencing logic to emit events without coupling to Redux.
 */
export function createSdk(): SDK {
  return Object.entries(actions).reduce(
    (sdk, [name, creators]) => ({
      ...sdk,
      [name]: bindActionCreators(creators, store.dispatch),
    }),
    {} as SDK,
  );
}

// Same signature, just wrapped with `dispatch()`.
type SDK = typeof actions;

export default createSdk();
