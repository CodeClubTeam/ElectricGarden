import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { currentOrganisationSelector } from '../../../selectors';
import { useOrganisationSwitch } from '../hooks';
import { OrganisationSelector } from './OrganisationSelector';

export const OrganisationSwitcher: React.FC = () => {
    const selectedOrganisation = useSelector(currentOrganisationSelector);
    const switcher = useOrganisationSwitch();

    const handleSelect = useCallback(
        async (organisation: ServerOrganisation) => {
            switcher.setOrganisationId(organisation.id);
        },
        [switcher],
    );

    return (
        <OrganisationSelector
            value={selectedOrganisation}
            onChange={handleSelect}
        />
    );
};
