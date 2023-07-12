import { createSelector } from 'reselect';

import { AppState, PricedCartItem } from '../../types';
import { productsSelector } from '../product';

const shoppingCartSelector = (state: AppState) => state.shoppingCart;

const calculateTotal = (items: PricedCartItem[]) =>
  items.reduce((total, { price, quantity }) => total + price * quantity, 0);

export const cartItemsSelector = createSelector(
  shoppingCartSelector,
  productsSelector,
  ({ items }, products) =>
    items.map(
      (item): PricedCartItem => {
        const product = products.find((p) => ['eg', 'egft'].includes(p.type));
        if (!product) {
          throw new Error(`EG product not found`);
        }
        const { quantity } = item;
        return {
          ...product,
          quantity,
        };
      },
    ),
);

export const cartSubscriptionItemsSelector = createSelector(
  cartItemsSelector,
  (items) => items.filter(({ subscription }) => !!subscription),
);

export const cartSubscriptionTotalSelector = createSelector(
  cartSubscriptionItemsSelector,
  calculateTotal,
);

const cartSubtotalSelector = createSelector(cartItemsSelector, calculateTotal);

const GST = 0.15;

export const cartTotalsSelector = createSelector(
  cartSubtotalSelector,
  (subtotal) => {
    const gst = subtotal * GST;
    const total = subtotal + gst;
    return {
      subtotal,
      gst,
      total,
    };
  },
);
