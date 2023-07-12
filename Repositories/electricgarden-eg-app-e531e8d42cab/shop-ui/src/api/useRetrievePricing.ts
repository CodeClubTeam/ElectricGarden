import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { pricingFetchedSelector } from '../pages/product';
import { AppDispatch } from '../types';
import { useApi } from './useApi';

export const useRetrievePricing = () => {
  const fetched = useSelector(pricingFetchedSelector);
  const [fetching, setFetching] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { getUnitPricing } = useApi();
  useEffect(() => {
    if (fetched) {
      return;
    }
    setFetching(true);
    getUnitPricing()
      .then((pricing) => {
        dispatch({ type: 'UNIT_PRICING_RECEIVED', payload: pricing });
      })
      .finally(() => {
        setFetching(false);
      });
  }, [fetched, dispatch, getUnitPricing]);

  return fetching;
};
