import { createSelector } from 'reselect';

import { initialOrderDetails } from './constants';
import { cartItemsSelector } from './pages/cart';
import { AppState } from './types';

const navigationSelector = (state: AppState) => state.navigation;

export const pageNameSelector = createSelector(
  navigationSelector,
  ({ pageName }) => pageName,
);

export const initialOrderFormDetailsSelector = () => ({
  ...initialOrderDetails,
});

export const errorOrUndefinedSelector = (state: AppState) => state.error;

export const itemsSelector = cartItemsSelector;
