import * as Redux from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import { rootReducer } from './reducer';

const composeEnhancers = composeWithDevTools({});

export const createStore = () => {
  const store = Redux.createStore(rootReducer, composeEnhancers());
  return store;
};
