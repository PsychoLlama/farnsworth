import { State } from '../../reducers/initial-state';
import * as effects from '../../effects';

/** Runs the garbage collector after every action. */
export function middleware(store: Store) {
  return (next: Next) => (action: unknown) => {
    const dispatchReturnValue = next(action);

    const state = store.getState();
    effects.gc.run(state);

    return dispatchReturnValue;
  };
}

interface Next {
  (action: unknown): State;
}

interface Store {
  getState(): State;
}
