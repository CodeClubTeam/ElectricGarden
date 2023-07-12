import { useField } from 'formik';
import React from 'react';

import {
  AppCheckboxField,
  AppField,
  AppFieldProps,
  CheckboxFieldContainer,
  FieldContainer,
} from '../../shared';
import { CustomerDetails } from './types';
import { AddressFields } from './AddressFields';

const Field: React.FC<AppFieldProps<CustomerDetails>> = ({
  name,
  ...props
}) => (
  <FieldContainer>
    <AppField<any> {...props} name={`customerDetails.${name}`} />
  </FieldContainer>
);

const CheckboxField: React.FC<AppFieldProps<CustomerDetails>> = ({
  name,
  ...props
}) => (
  <CheckboxFieldContainer>
    <AppCheckboxField<any> {...props} name={`customerDetails.${name}`} />
  </CheckboxFieldContainer>
);

const useBillingEmailFieldName: keyof CustomerDetails =
  'useDifferentBillingEmail';

const useBillingEmailEnabled = () => {
  const [, meta] = useField({
    name: `customerDetails.${useBillingEmailFieldName}`,
  });
  return !!meta.value;
};

export const DetailsFields: React.FC = () => {
  const billingEmailEnabled = useBillingEmailEnabled();
  return (
    <>
      <Field
        label="Name"
        name="name"
        type="text"
        placeholder="Enter your name"
      />
      <Field
        label="Organisation Name"
        name="organisationName"
        type="text"
        placeholder="your school name"
      />
      <Field
        label="Email Address"
        name="email"
        type="email"
        placeholder="enter your email address"
      />
      <CheckboxField
        name="newsletterOptIn"
        label="Keep in the know with the electric garden newsletter"
      />

      <CheckboxField
        name="useDifferentBillingEmail"
        label="Enter a different billing email address"
      />
      {billingEmailEnabled && (
        <Field
          label=""
          name="billingEmail"
          type="email"
          placeholder="enter your billing email address"
        />
      )}
      <CheckboxField
        name="useDifferentBillingAddress"
        label="Enter a different postal address for billing"
      />

      <AddressFields property="billingAddress" label="Billing Address" />
      <AddressFields property="shippingAddress" label="Shipping Address" />
    </>
  );
};
