import { FieldProps } from 'formik';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import Select, { ValueType } from 'react-select';
import styled from 'styled-components/macro';

import { organisationOptionsSelector } from '../selectors';

type Props = Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    'value' | 'onChange'
> & {
    value?: string;
    onChange?: (value?: string) => void;
    placeholder?: string;
    clearable?: boolean;
};

const Container = styled.div`
    width: 300px;
`;

export const OrganisationIdSelector: React.FC<Props> = ({
    value,
    onChange,
    placeholder,
    clearable,
}) => {
    let options = useSelector(organisationOptionsSelector);

    if (clearable) {
        options = [
            {
                value: '',
                label: placeholder ?? 'None selected',
            },
            ...options,
        ];
    }

    const handleSelect = useCallback(
        (item: ValueType<Tag, false>) => {
            if (onChange) {
                onChange(item?.value);
            }
        },
        [onChange],
    );

    const selectedOption = value
        ? options.find((opt) => opt.value === value)
        : undefined;

    return (
        <Container>
            <Select
                options={options}
                value={selectedOption}
                onChange={handleSelect}
                placeholder={placeholder}
                isClearable={clearable}
                styles={{
                    control: (base) => ({
                        ...base,
                        backgroundColor: 'white',
                    }),
                    menu: (base) => ({
                        ...base,
                        margin: '1px 0',
                    }),
                }}
                components={{
                    IndicatorSeparator: () => null,
                }}
            />
        </Container>
    );
};

export const OrganisationIdSelectorField: React.FC<Props & FieldProps> = ({
    field,
    form,
    ...props
}) => (
    <OrganisationIdSelector
        {...props}
        name={field.name}
        onChange={(value) => form.setFieldValue(field.name, value)}
        onBlur={field.onBlur}
        value={field.value}
    />
);
