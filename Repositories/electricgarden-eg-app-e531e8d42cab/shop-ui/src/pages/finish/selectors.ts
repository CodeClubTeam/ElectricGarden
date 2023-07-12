import { AppState } from '../../types';
import { createSelector } from 'reselect';

const finishStateSelector = (state: AppState) => state.finish;

export const creditCardFinishResultSelector = createSelector(
  finishStateSelector,
  (state) => state.creditCardResult,
);

export const creditCardSaleCheckoutId = createSelector(
  creditCardFinishResultSelector,
  (result) => {
    if (!result) {
      throw new Error(`No credit card sale result found`);
    }
    return result.checkoutId;
  },
);

export const paymentMethodSelector = createSelector(
  finishStateSelector,
  (state) => (state.orderDetails ? state.orderDetails.payment.method : 'cc'),
);

export const orderDetailsSelector = createSelector(
  finishStateSelector,
  ({ orderDetails }) => {
    if (!orderDetails) {
      throw new Error(`No orderDetails found.`);
    }
    return orderDetails;
  },
);
