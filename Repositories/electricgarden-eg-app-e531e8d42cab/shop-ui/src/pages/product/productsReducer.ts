import { Reducer } from 'redux';

import { AppAction, Product } from '../../types';
import { products } from '../../constants';

type State = {
  fetched: boolean;
  products: Product[];
};

const initialState: State = {
  fetched: false,
  products,
};

export const productsReducer: Reducer<State> = (
  state = initialState,
  action: AppAction,
) => {
  switch (action.type) {
    case 'UNIT_PRICING_RECEIVED':
      const { annualPlan, monthlyPlan } = action.payload;
      return {
        ...state,
        fetched: true,
        products: state.products.map((p) =>
          p.type === 'eg'
            ? { ...p, price: annualPlan }
            : p.type === 'egft'
            ? { ...p, price: monthlyPlan }
            : p,
        ),
      };
  }

  return state;
};
