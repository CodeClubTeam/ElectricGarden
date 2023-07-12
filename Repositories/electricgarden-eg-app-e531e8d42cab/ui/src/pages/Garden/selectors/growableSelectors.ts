import { createSelector } from 'reselect';

import { currentOrganisationStateSelector } from '../../../selectors';
import { createServerDataStateSelectors } from '../../../utils';
import { selectedTeamIdSelector } from './viewStateSelectors';

const growablesStateSelector = createSelector(
    currentOrganisationStateSelector,
    (state) => state.garden.growables,
);

const selectors = createServerDataStateSelectors(growablesStateSelector);

export const growablesFetchStateSelector = selectors.fetchStateSelector;

export const growablesSelector = selectors.items;

export const growablesByIdSelector = selectors.itemsByKey;

export const growableOfSelectedTeamForIdSelectorCreate = (growableId: string) =>
    createSelector(
        growablesForSelectedTeamSelector,
        (growables): ServerGrowable | undefined =>
            growables.find((g) => g.id === growableId),
    );

export const growablesForSelectedTeamSelector = createSelector(
    selectedTeamIdSelector,
    growablesSelector,
    (teamId, growables) => growables.filter((g) => g.teamId === teamId),
);
