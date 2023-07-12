import { createAction, createPromiseAction } from 'redux-helper';

import getServer from '../../data/server';

export const fetchOrganisationsSucceeded = createAction<ServerOrganisation[]>(
    'FETCH_ORGANISATIONS_SUCCEEDED',
);

export const fetchOrganisations = createPromiseAction<{}, ServerOrganisation[]>(
    'FETCH_ORGANISATIONS',
    async () => {
        const result = await getServer().organisation.list();
        return result.items;
    },
    fetchOrganisationsSucceeded,
);

export const updatedOrCreatedOrganisation = createAction<ServerOrganisation>(
    'UPDATED_OR_CREATED_ORGANISATION',
);
