import { createStore, compose, applyMiddleware } from 'redux';
import { middleware as retreonMiddleware } from 'retreon';
import { middleware as gcMiddleware } from './middleware/garbage-collection';
import { middleware as trackSyncMiddleware } from './middleware/track-sync';
import reducers from '../reducers';
import initialState, { State } from '../reducers/initial-state';
import composeReducers from './compose-reducers';

const DEVTOOLS_KEY = '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__';

export default function initialize(state: State = initialState) {
  const reducer = composeReducers(reducers);
  const composeEnhancers = window[DEVTOOLS_KEY] || compose;
  const enhancer = composeEnhancers(
    applyMiddleware(retreonMiddleware, trackSyncMiddleware, gcMiddleware),
  );

  return createStore(reducer, state, enhancer);
}
