import React from 'react';
import { PlantedEvent } from '../../../types';
import { Select } from '../../../../../atomic-ui/atoms/Select';
import { FieldProps } from 'formik';

type MethodType = PlantedEvent['data']['method'];

type Method = {
    type: MethodType;
    title: string;
};

const methods: Method[] = [
    {
        type: 'seed',
        title: 'Seed',
    },
    {
        type: 'seedling',
        title: 'Seedling',
    },
];

type Props = Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    'value' | 'onChange'
> & {
    value?: MethodType;
    onChange?: (value?: MethodType) => void;
};

export const PlantMethodSelector: React.FC<Props> = ({
    value,
    onChange,
    ...selectAttributes
}) => {
    const handleChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            if (onChange) {
                onChange(e.target.value as MethodType);
            }
        },
        [onChange],
    );

    return (
        <Select {...selectAttributes} onChange={handleChange} value={value}>
            {!value && <option>Choose method</option>}
            {methods.map(({ type, title }) => (
                <option key={type} value={type}>
                    {title}
                </option>
            ))}
        </Select>
    );
};

export const PlantMethodSelectorInput: React.FC<Props & FieldProps> = ({
    field,
    form,
    ...props
}) => (
    <PlantMethodSelector
        {...props}
        name={field.name}
        onChange={(value) => form.setFieldValue(field.name, value)}
        onBlur={field.onBlur}
        value={field.value}
    />
);
