import { Form, Formik } from 'formik';
import React from 'react';
import { useSelector } from 'react-redux';

import { useSubmitOrder } from '../api/useSubmitOrder';
import { initialOrderFormDetailsSelector } from '../selectors';
import { FormRouter } from './FormRouter';
import { orderValidationSchema } from './orderValidationSchema';

export const OrderForm: React.FC = () => {
  const initialValues = useSelector(initialOrderFormDetailsSelector);
  const handleSubmit = useSubmitOrder();
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={orderValidationSchema}
      onSubmit={handleSubmit}
    >
      <Form>
        <FormRouter />
        {/* <Persist name={FORM_STATE_PERSISTENCE_KEY} /> */}
      </Form>
    </Formik>
  );
};
