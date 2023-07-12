import { Reducer } from 'redux';

import { AppAction, CreditCardPaymentResult, OrderDetails } from '../../types';

type State = {
  creditCardResult?: CreditCardPaymentResult;
  orderDetails?: OrderDetails;
};

const initialState: State = {};

export const finishReducer: Reducer<State> = (
  state = initialState,
  action: AppAction,
) => {
  switch (action.type) {
    case 'SET_CREDIT_CARD_PAYMENT_RESULT':
      return {
        ...state,
        creditCardResult: action.payload,
      };
    case 'SET_ORDER_DETAILS':
      const orderDetails = action.payload;
      const { customerDetails } = orderDetails;
      if (!customerDetails.billingEmail) {
        customerDetails.billingEmail = customerDetails.email;
      }
      return {
        ...state,
        orderDetails,
      };
  }
  return state;
};
