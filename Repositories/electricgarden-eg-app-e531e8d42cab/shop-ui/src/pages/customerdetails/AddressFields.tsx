import { useField } from 'formik';
import React, { useCallback } from 'react';

import { AppField, AppFieldProps, FieldContainer } from '../../shared';
import { Address } from '../../types';
import { CustomerDetails } from './types';

type Props = {
  property: keyof Pick<CustomerDetails, 'billingAddress' | 'shippingAddress'>;
  label: string;
};

const useBillingAddressFieldName: keyof CustomerDetails =
  'useDifferentBillingAddress';

const useBillingAddressEnabled = () => {
  const [, meta] = useField({
    name: `customerDetails.${useBillingAddressFieldName}`,
  });
  return !!meta.value;
};

export const AddressFields: React.FC<Props> = ({ property, label }) => {
  const Field: React.FC<AppFieldProps<Address>> = useCallback(
    ({ name, ...props }) => (
      <FieldContainer>
        <AppField<any>
          {...props}
          name={`customerDetails.${property}.${name}`}
        />
      </FieldContainer>
    ),
    [property],
  );

  const billingAddressEnabled = useBillingAddressEnabled();
  if (property === 'billingAddress' && !billingAddressEnabled) {
    return null;
  }

  return (
    <>
      <Field
        label={label}
        name="line1"
        type="text"
        placeholder="Street address or box number"
      />
      <Field name="line2" type="text" placeholder="Suburb" />
      <Field name="city" type="text" placeholder="City" />
      <Field name="postcode" type="text" placeholder="Postcode" />
      <Field name="country" type="text" disabled />
    </>
  );
};
