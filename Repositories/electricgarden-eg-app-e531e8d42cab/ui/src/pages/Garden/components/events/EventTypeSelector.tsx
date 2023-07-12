import { FieldProps } from 'formik';
import React from 'react';
import { useSelector } from 'react-redux';

import { Select } from '../../../../atomic-ui/atoms/Select';
import { formAddableEventTypesSelector } from '../../selectors';

type Props = Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    'value' | 'onChange'
> & {
    value?: string;
    onChange?: (value?: string) => void;
};

export const EventTypeSelector: React.FC<Props> = ({
    value,
    onChange,
    ...selectAttributes
}) => {
    const eventTypes = useSelector(formAddableEventTypesSelector);

    const handleChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            if (onChange) {
                onChange(e.target.value);
            }
        },
        [onChange],
    );

    return (
        <Select
            {...selectAttributes}
            onChange={handleChange}
            value={value || ''}
        >
            {!value && <option value="">Choose event type</option>}
            {eventTypes.map(({ type, title }) => (
                <option key={type} value={type}>
                    {title}
                </option>
            ))}
        </Select>
    );
};

export const EventTypeSelectorInput: React.FC<Props & FieldProps> = ({
    field,
    form,
    onChange,
    ...props
}) => (
    <EventTypeSelector
        {...props}
        name={field.name}
        onChange={(value) => {
            form.setFieldValue(field.name, value);
            if (onChange) {
                onChange(value);
            }
        }}
        onBlur={field.onBlur}
        value={field.value}
    />
);
