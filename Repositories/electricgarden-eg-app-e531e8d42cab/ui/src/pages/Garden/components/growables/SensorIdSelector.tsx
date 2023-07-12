import { FieldProps } from 'formik';
import React from 'react';

import { Select } from '../../../../atomic-ui/atoms/Select';
import { useFetchSensors } from '../../hooks';

type Props = Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    'value' | 'onChange'
> & {
    value?: string;
    onChange?: (value?: string) => void;
    keySelector: (sensor: ServerSensor) => string;
    filter?: (sensor: ServerSensor) => boolean;
};

const SensorSelector: React.FC<Props> = ({
    value,
    onChange,
    keySelector,
    filter = () => true,
    ...selectAttributes
}) => {
    const { fetching, values } = useFetchSensors();

    const handleChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            if (onChange) {
                onChange(e.target.value);
            }
        },
        [onChange],
    );

    return (
        <Select {...selectAttributes} onChange={handleChange} value={value}>
            {fetching && <option>Loading...</option>}
            {!fetching && !value && <option>Select a device</option>}
            {!fetching &&
                values.filter(filter).map((value) => (
                    <option key={keySelector(value)} value={keySelector(value)}>
                        {value.serial} ({value.name})
                    </option>
                ))}
        </Select>
    );
};

export const SensorIdSelector: React.FC<Omit<Props, 'keySelector'>> = (
    props,
) => <SensorSelector {...props} keySelector={(sensor) => sensor.id} />;

export const SensorSerialSelector: React.FC<Omit<Props, 'keySelector'>> = (
    props,
) => <SensorSelector {...props} keySelector={(sensor) => sensor.serial} />;

export const SensorIdSelectorField: React.FC<Props & FieldProps> = ({
    field,
    form,
    ...props
}) => (
    <SensorIdSelector
        {...props}
        name={field.name}
        onChange={(value) => form.setFieldValue(field.name, value)}
        onBlur={field.onBlur}
        value={field.value}
    />
);

export const SensorSerialSelectorField: React.FC<Props & FieldProps> = ({
    field,
    form,
    ...props
}) => (
    <SensorSerialSelector
        {...props}
        name={field.name}
        onChange={(value) => form.setFieldValue(field.name, value)}
        onBlur={field.onBlur}
        value={field.value}
    />
);
