import { Field } from 'formik';
import React from 'react';
import styled from 'styled-components/macro';

import { FieldValidationError } from '../../../../../atomic-ui';
import { HarvestedEvent } from '../../../types';
import { EventInputProp } from '../valueProps';
import { getAmountLabel } from './lookups';

type Props = EventInputProp<HarvestedEvent>;

const AmountContainer = styled.div`
    text-align: right;
    grid-column: 2;
`;

export const HarvestedEventInput: React.FC<Props> = ({ form, field }) => {
    const amountField = `${field.name}.amount`;
    const { value } = form.values;
    const type =
        value && value.type === 'harvested' && value.data
            ? value.data.type
            : undefined;
    return (
        <AmountContainer>
            <label htmlFor="amount">{getAmountLabel(type)}</label>
            <Field name={amountField} id="amount" type="number" />
            <FieldValidationError name={amountField} form={form} />
        </AmountContainer>
    );
};
