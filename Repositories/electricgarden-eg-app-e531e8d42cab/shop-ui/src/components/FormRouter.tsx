import React from 'react';
import { useSelector } from 'react-redux';

import { ShoppingCartPage } from '../pages/cart';
import { CustomerDetailsPage } from '../pages/customerdetails';
import { PaymentPage } from '../pages/payment';
import { ProductPage } from '../pages/product';
import { pageNameSelector } from '../selectors';

export const FormRouter: React.FC = () => {
  const pageName = useSelector(pageNameSelector);
  return (
    <>
      {pageName === 'products' && <ProductPage />}
      {pageName === 'cart' && <ShoppingCartPage />}
      {pageName === 'details' && <CustomerDetailsPage />}
      {pageName === 'payment' && <PaymentPage />}
    </>
  );
};
