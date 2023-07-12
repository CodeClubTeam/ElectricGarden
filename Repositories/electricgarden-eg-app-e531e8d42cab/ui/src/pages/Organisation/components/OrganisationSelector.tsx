import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import Select, { ValueType } from 'react-select';

import { createAppStructuredSelector } from '../../../selectors';
import {
    organisationOptionsSelector,
    organisationsSelector,
} from '../selectors';

type Props = {
    value?: ServerOrganisation;
    onChange?: (newValue: ServerOrganisation) => void;
};

export const OrganisationSelector: React.FC<Props> = ({ value, onChange }) => {
    const { options, organisations } = useSelector(
        createAppStructuredSelector({
            options: organisationOptionsSelector,
            organisations: organisationsSelector,
        }),
    );

    const handleSelect = useCallback(
        (item: ValueType<Tag, false>) => {
            if (!item) {
                return;
            }
            const selectedId = item.value;
            const selectedOrg = organisations.find(
                ({ id }) => selectedId === id,
            );
            if (onChange && selectedOrg) {
                onChange(selectedOrg);
            }
        },
        [onChange, organisations],
    );

    const selectedOption = value
        ? options.find((opt) => opt.value === value.id)
        : undefined;

    return (
        <div style={{ width: '300px', margin: '0 40px' }}>
            <Select
                options={options}
                value={selectedOption}
                onChange={handleSelect}
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
        </div>
    );
};
