import { AppState } from './../../types';
import { createSelector } from 'reselect';

const productStateSelector = (state: AppState) => state.products;

export const pricingFetchedSelector = createSelector(
  productStateSelector,
  (state) => state.fetched,
);

export const productsSelector = createSelector(
  productStateSelector,
  (state) => state.products,
);
