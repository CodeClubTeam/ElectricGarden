import { PricedCartItem } from '../types';

export const isEgCartItemProduct = (item: PricedCartItem) =>
  ['eg', 'egft'].includes(item.type);
