import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { middleware } from 'retreon';
import * as reducers from '../reducers';

const DEVTOOLS_KEY = '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__';

export default function initialize() {
  const reducer = combineReducers(reducers);
  const composeEnhancers = window[DEVTOOLS_KEY] || compose;
  const enhancer = composeEnhancers(applyMiddleware(middleware));

  return createStore(reducer, enhancer);
}
