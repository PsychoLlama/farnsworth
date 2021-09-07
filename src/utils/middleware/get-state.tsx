import { State } from '../../reducers/initial-state';

export const GET_STATE = Symbol('middleware: GET_STATE');

export const middleware = (store: Store) => (next: Next) => (
  action: unknown,
) => {
  if (action === GET_STATE) {
    return store.getState();
  }

  return next(action);
};

interface Store {
  getState(): State;
}

interface Next {
  (action: unknown): unknown;
}

declare module 'redux' {
  interface Dispatch {
    (action: typeof GET_STATE): State;
  }
}
