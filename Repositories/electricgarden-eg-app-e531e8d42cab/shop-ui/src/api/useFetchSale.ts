import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { creditCardSaleCheckoutId } from '../pages/finish/selectors';
import { SaleDetails, useApi } from './useApi';

export const useFetchSale = () => {
  const [fetching, setFetching] = useState(true);
  const [sale, setSale] = useState<SaleDetails | undefined>();
  const checkoutId = useSelector(creditCardSaleCheckoutId);
  const { getSale } = useApi();

  useEffect(() => {
    setFetching(true);
    getSale(checkoutId)
      .then(setSale)
      .finally(() => {
        setFetching(false);
      });
  }, [getSale, checkoutId]);

  return { fetching, sale } as
    | { fetching: true }
    | { fetching: false; sale: SaleDetails };
};
