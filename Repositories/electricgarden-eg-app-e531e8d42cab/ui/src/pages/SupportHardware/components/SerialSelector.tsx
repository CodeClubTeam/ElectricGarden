import { FieldProps } from 'formik';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import Select, { Props as SelectProps, ValueType } from 'react-select';
import styled from 'styled-components/macro';
import {
    suSensorsBySerialSelector,
    unassignedSuSensorsSelector,
} from '../selectors';

type SensorItem = { serial: string };

type Props = Omit<SelectProps, 'value' | 'onChange'> & {
    value?: string;
    onChange?: (value?: string) => void;
    unassignedOnly?: boolean;
};

const sensorToOption = ({ serial }: SensorItem): Tag => ({
    value: serial,
    label: serial,
});

const Container = styled.div`
    min-width: 15em;
`;

export const SerialSelector: React.FC<Props> = ({
    value,
    onChange,
    unassignedOnly = false,
    ...selectAttributes
}) => {
    const values = useSelector(
        unassignedOnly
            ? unassignedSuSensorsSelector
            : suSensorsBySerialSelector,
    );

    const handleSelect = useCallback(
        (item: ValueType<Tag, false>) => {
            if (onChange) {
                onChange(item?.value);
            }
        },
        [onChange],
    );

    const option = value ? sensorToOption({ serial: value }) : undefined;
    const options = values.map(sensorToOption);

    return (
        <Container>
            <Select
                isClearable
                placeholder="Select serial"
                {...selectAttributes}
                onChange={handleSelect}
                value={option}
                options={options}
            />
        </Container>
    );
};

export const SerialSelectorField: React.FC<Props & FieldProps> = ({
    field,
    form,
    ...props
}) => (
    <SerialSelector
        {...props}
        name={field.name}
        onChange={(value) => form.setFieldValue(field.name, value)}
        onBlur={field.onBlur}
        value={field.value}
    />
);
