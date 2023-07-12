import React from 'react';
import { useSelector } from 'react-redux';

import { useTracking } from '../api';
import { FinishPage } from '../pages/finish';
import { pageNameSelector } from '../selectors';
import { OrderForm } from './OrderForm';

export const Router: React.FC = () => {
  const pageName = useSelector(pageNameSelector);
  useTracking();

  return (
    <>
      {pageName !== 'finish' && <OrderForm />}
      {pageName === 'finish' && <FinishPage />}
    </>
  );
};
