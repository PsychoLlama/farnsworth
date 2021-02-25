import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { middleware } from 'retreon';
import * as reducers from '../reducers';
import initialState, { State } from '../reducers/initial-state';

const DEVTOOLS_KEY = '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__';

export default function initialize(state: State = initialState) {
  const reducer = combineReducers(reducers);
  const composeEnhancers = window[DEVTOOLS_KEY] || compose;
  const enhancer = composeEnhancers(applyMiddleware(middleware));

  return createStore(reducer, state, enhancer);
}
