import { Reducer } from 'redux';
import { products } from '../../constants';

import { AppAction, CartItem } from '../../types';

type State = {
  items: CartItem[];
};

const initialState: State = {
  items: [{ productType: products[0].type, quantity: 1 }],
};

export const shoppingCartReducer: Reducer<State> = (
  state = initialState,
  action: AppAction,
) => {
  switch (action.type) {
    case 'SET_SHOPPING_CART_QUANTITY': {
      const { quantity, type: productType } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.productType !== productType
            ? item
            : {
                ...item,
                quantity,
              },
        ),
      };
    }
  }
  return state;
};
