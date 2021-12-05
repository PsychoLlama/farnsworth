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
  return Object.entries(actions).reduce((sdk, [name, creators]) => {
    return {
      ...sdk,
      [name]: bindActionCreators(creators, reduxStore.dispatch),
    };
  }, {} as SDK);
}

type Actions = typeof actions;

// Retreon uses generator functions for all action creators. The SDK
// transforms their type signatures into (args) => Dispatch<T>, which is the
// equivalent of `bindActionCreators(...)`.
type SDK = {
  [ToolkitName in keyof Actions]: {
    [CreatorName in keyof Actions[ToolkitName]]: Actions[ToolkitName][CreatorName] extends (
      ...args: infer Args
    ) => AsyncGenerator<unknown, infer R>
      ? (...args: Args) => Promise<R>
      : Actions[ToolkitName][CreatorName] extends (
          ...args: infer Args
        ) => Generator<unknown, infer R>
      ? (...args: Args) => R
      : never;
  };
};
