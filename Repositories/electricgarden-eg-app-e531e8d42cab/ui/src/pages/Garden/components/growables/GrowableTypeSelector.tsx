import { FieldProps } from 'formik';
import React from 'react';

import { Select } from '../../../../atomic-ui/atoms/Select';
import { useFetchGrowableTypes } from '../../hooks';

type Props = Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    'value' | 'onChange'
> & {
    value?: string;
    onChange?: (value?: string) => void;
};

export const GrowableTypeIdSelector: React.FC<Props> = ({
    value,
    onChange,
    ...selectAttributes
}) => {
    const { values, fetching } = useFetchGrowableTypes();

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
            value={value}
            disabled={fetching || selectAttributes.disabled}
        >
            {fetching ? (
                <option>Loading...</option> // bit hacky. could use css
            ) : (
                <>
                    {!value && <option>Select type</option>}
                    {values.map(({ id, title }) => (
                        <option key={id} value={id}>
                            {title}
                        </option>
                    ))}
                </>
            )}
        </Select>
    );
};

export const GrowableTypeIdSelectorField: React.FC<Props & FieldProps> = ({
    field,
    form,
    ...props
}) => (
    <GrowableTypeIdSelector
        {...props}
        name={field.name}
        onChange={(value) => form.setFieldValue(field.name, value)}
        onBlur={field.onBlur}
        value={field.value}
    />
);
