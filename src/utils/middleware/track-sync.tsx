import { State } from '../../reducers/initial-state';
import * as effects from '../../effects';

/**
 * Detect new local tracks and make sure they're sent to the remote
 * participant. This should be one of the final middlewares.
 */
export function middleware(store: Store) {
  return (next: Next) => (action: unknown) => {
    const dispatchReturnValue = next(action);

    const state = store.getState();
    effects.tracks.sendLocalTracksToAllParticipants(state);

    return dispatchReturnValue;
  };
}

interface Next {
  (action: unknown): State;
}

interface Store {
  getState(): State;
}
