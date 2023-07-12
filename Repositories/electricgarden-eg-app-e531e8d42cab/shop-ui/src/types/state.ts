import { Reducer } from 'react';
import { Dispatch } from 'redux';

import { cartItemsSelector } from '../pages/cart';
import { CustomerDetails } from '../pages/customerdetails';
import { PaymentDetails } from '../pages/payment';
import { rootReducer } from '../reducer';

export type AppState = ReturnType<typeof rootReducer>;

export type AppAction =
  | {
      type: 'NEXT_PAGE';
    }
  | {
      type: 'PREVIOUS_PAGE';
    }
  | {
      type: 'NAVIGATE_TO_PAGE';
      payload: PageName;
    }
  | { type: 'UNIT_PRICING_RECEIVED'; payload: UnitPricing }
  | {
      type: 'SET_SHOPPING_CART_QUANTITY';
      payload: {
        type: ProductType;
        quantity: number;
      };
    }
  | {
      type: 'SET_CREDIT_CARD_PAYMENT_RESULT';
      payload: CreditCardPaymentResult;
    }
  | {
      type: 'SET_ORDER_DETAILS';
      payload: OrderDetails;
    }
  | { type: 'DISMISS_ERROR' }
  | { type: 'HTTP_ERROR'; payload: { response?: Response; error: Error } }
  | { type: 'UI_ERROR'; payload: { error: Error; errorInfo: React.ErrorInfo } };

export type PageName = 'products' | 'cart' | 'details' | 'payment' | 'finish'; // could pull these from manifests on page index.ts files

export type CreditCardPaymentResult = {
  status: 'success' | 'cancelled';
  checkoutId: string;
};

export type OrderItems = ReturnType<typeof cartItemsSelector>;

export type OrderItem<T = OrderItems> = T extends Array<infer TItem>
  ? TItem
  : T;

export type OrderDetails = {
  customerDetails: CustomerDetails;
  payment: PaymentDetails;
  items: OrderItems;
};

export type OrderFormDetails = Omit<OrderDetails, 'items'>;

export type AppReducer<TState> = Reducer<TState, AppAction>;

export type AppDispatch = Dispatch<AppAction>;

export type Product = {
  type: ProductType;
  price: number;
  subscription?: boolean;
};

export type ProductType = 'eg' | 'egft';

export type CartItem = {
  productType: ProductType;
  quantity: number;
};

export type PricedCartItem = Product & Pick<CartItem, 'quantity'>;

export type PaymentMethod = 'cc' | 'po';

export type Address = {
  line1: string;
  line2: string;
  line3: string;
  city: string;
  postcode: string;
  country: string;
};

export type UnitPricing = {
  annualPlan: number;
  monthlyPlan: number;
  shipping: number;
};
