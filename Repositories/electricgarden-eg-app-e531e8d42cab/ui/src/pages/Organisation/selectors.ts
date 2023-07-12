import { createSelector } from 'reselect';

import { currentOrganisationSelector } from '../../selectors';
import { AppState } from '../../types';
import { createServerDataStateSelectors, thingToOption } from '../../utils';

const organisationsStateSelector = (state: AppState) => state.organisations;

const selectors = createServerDataStateSelectors(organisationsStateSelector);

export const organisationsFetchStateSelector = selectors.fetchStateSelector;

export const organisationsSelector = selectors.items;

export const organisationsByIdSelector = selectors.itemsByKey;

export const organisationOptionsSelector = createSelector(
    organisationsSelector,
    (orgs) => orgs.map(thingToOption),
);

export const currentOrganisationOptionSelector = createSelector(
    currentOrganisationSelector,
    (org) => thingToOption(org),
);
