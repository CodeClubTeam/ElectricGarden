import { FieldProps } from 'formik';
import React from 'react';
import { connect } from 'react-redux';
import Select, { ValueType } from 'react-select';

import { sensorOptionsSelector } from '../../pages/Hardware/selectors';
import { teamOptionsSelector } from '../../pages/Teams/selectors';
import { ensureUsersFetched } from '../../pages/Users/components/ensureUsersFetched';
import { userOptionsSelector } from '../../pages/Users/selectors';
import { createAppStructuredSelector } from '../../selectors';
import { AppState } from '../../types';

type Props = {
    options: Tag[];
} & FieldProps;

export const Tags: React.FC<Props> = ({ options, field, form }) => {
    const handleOnChange = React.useCallback(
        (newTags: ValueType<Tag, true>) => {
            form.setFieldValue(
                field.name,
                (newTags ?? []).map(({ value }) => value),
            );
        },
        [field, form],
    );

    const value = options.filter((option) =>
        (field.value ?? []).includes(option.value),
    );

    return (
        <div className="tags-area">
            <Select
                isMulti
                isClearable={false}
                value={value}
                options={options}
                onChange={handleOnChange}
                name={field.name}
                inputId={field.name} // slightly risky
                onBlur={field.onBlur}
                styles={{
                    control: (base) => ({
                        ...base,
                        backgroundColor: '#D4EDD1',
                        border: 'none',
                    }),
                    multiValue: (base) => ({
                        ...base,
                        backgroundColor: '#53B848',
                        border: 'none',
                        padding: '5px',
                        borderRadius: '4px',
                        margin: '2px 8px',
                    }),
                    multiValueLabel: (base) => ({
                        ...base,
                        color: 'white',
                    }),
                    menu: (base) => ({ ...base, margin: '1px 0' }),
                    valueContainer: (base) => ({
                        ...base,
                        padding: '10px',
                    }),
                }}
                components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                }}
            />
        </div>
    );
};

export const SensorTags = connect((appState: AppState, props: Props) => ({
    options: sensorOptionsSelector(appState),
}))((props: Props) => <Tags {...props} />);

export const TeamTags = connect((appState: AppState, props: Props) => ({
    options: teamOptionsSelector(appState),
}))((props: Props) => <Tags {...props} />);

export const UserTags = connect(
    createAppStructuredSelector({
        options: userOptionsSelector,
    }),
)(ensureUsersFetched((props: Props) => <Tags {...props} />));
