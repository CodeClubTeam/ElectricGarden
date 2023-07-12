import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { itemsSelector } from '../selectors';
import { AppDispatch, OrderDetails, OrderFormDetails } from '../types';
import { useSubscriber } from './useSubscriber';

export const useSubmitOrder = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(itemsSelector);
  const { subscribe } = useSubscriber();
  const handleSubmit = useCallback(
    async (values: OrderFormDetails) => {
      try {
        const orderDetails: OrderDetails = {
          ...values,
          items,
        };
        dispatch({ type: 'SET_ORDER_DETAILS', payload: orderDetails });
        await subscribe(orderDetails);
        if (values.payment.method === 'po') {
          dispatch({ type: 'NAVIGATE_TO_PAGE', payload: 'finish' });
        }
      } catch (error) {
        throw error;
      }
    },
    [dispatch, items, subscribe],
  );
  return handleSubmit;
};
