import { FieldProps } from 'formik';
import React from 'react';

import { Select } from '../../../atomic-ui/atoms/Select';
import { useTeams } from '../hooks';

type Props = Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    'value' | 'onChange'
> & {
    value?: string;
    onChange?: (value?: string) => void;
    unsetLabel: string;
    readonly?: boolean;
};

export const TeamIdSelector: React.FC<Props> = ({
    value,
    onChange,
    unsetLabel,
    readonly,
    ...selectAttributes
}) => {
    const { values, fetching } = useTeams();

    const handleChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            if (onChange) {
                const value = e.target.value;
                // workaround that value gets sent through as label if no value in html
                onChange(value !== unsetLabel ? value : undefined);
            }
        },
        [onChange, unsetLabel],
    );

    if (readonly) {
        const selectedTeam = values.find(({ id }) => id === value);
        return <p>{selectedTeam?.name ?? unsetLabel}</p>;
    }

    return (
        <Select
            {...selectAttributes}
            onChange={handleChange}
            value={value ?? ''}
            disabled={fetching || selectAttributes.disabled}
        >
            {fetching ? (
                <option>Loading...</option> // bit hacky. could use css
            ) : (
                <>
                    {<option>{unsetLabel}</option>}
                    {values.map(({ id, name }) => (
                        <option key={id} value={id}>
                            {name}
                        </option>
                    ))}
                </>
            )}
        </Select>
    );
};

export const TeamIdSelectorField: React.FC<Props & FieldProps> = ({
    field,
    form,
    ...props
}) => (
    <TeamIdSelector
        {...props}
        name={field.name}
        onChange={(value) => form.setFieldValue(field.name, value)}
        onBlur={field.onBlur}
        value={field.value}
    />
);
