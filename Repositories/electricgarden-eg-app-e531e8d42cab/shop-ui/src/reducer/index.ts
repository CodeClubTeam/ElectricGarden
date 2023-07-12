import { combineReducers } from 'redux';

import { shoppingCartReducer } from '../pages/cart';
import { navigationReducer } from './navigationReducer';
import { finishReducer } from '../pages/finish';
import { productsReducer } from '../pages/product';
import { errorReducer } from './errorReducer';

export const rootReducer = combineReducers({
  navigation: navigationReducer,
  products: productsReducer,
  shoppingCart: shoppingCartReducer,
  finish: finishReducer,
  error: errorReducer,
});
