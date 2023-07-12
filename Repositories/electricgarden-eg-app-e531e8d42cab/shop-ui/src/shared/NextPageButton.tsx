import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch, OrderDetails } from '../types';
import { PrimaryButton } from './Button';
import { useFormikContext } from 'formik';

export const NextPageButton: React.FC<React.ButtonHTMLAttributes<
  HTMLButtonElement
>> = (props) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleClick = useCallback(() => {
    dispatch({ type: 'NEXT_PAGE' });
  }, [dispatch]);

  return (
    <PrimaryButton {...props} onClick={handleClick}>
      {props.children || 'Continue'}
    </PrimaryButton>
  );
};

export const NextPageSubmitButton: React.FC<React.ButtonHTMLAttributes<
  HTMLButtonElement
> & { section: keyof OrderDetails }> = ({ section, ...props }) => {
  const { errors, touched } = useFormikContext<OrderDetails>();
  const isEdited = !!touched[section];
  const haveErrors = !!errors[section];
  return (
    <NextPageButton type="submit" {...props} disabled={!isEdited || haveErrors}>
      {props.children || 'Continue'}
    </NextPageButton>
  );
};
