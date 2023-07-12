import { Field } from 'formik';
import React from 'react';

import { FieldValidationError } from '../../../../../atomic-ui';
import { PlantedEvent } from '../../../types';
import { PlantMethodSelectorInput } from './PlantMethodSelector';
import { EventInputProp } from '../valueProps';

type Props = EventInputProp<PlantedEvent>;

export const PlantedEventInput: React.FC<Props> = ({ form, field }) => {
    const name = `${field.name}.method`;
    return (
        <>
            <Field
                name={name}
                id="method"
                component={PlantMethodSelectorInput}
            />
            <FieldValidationError name={name} form={form} />
        </>
    );
};
