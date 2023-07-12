import { values } from 'lodash';
import { createSelector } from 'reselect';

import { currentOrganisationStateSelector } from '../../selectors';
import { thingToOption } from '../../utils';

const teamStateSelector = createSelector(
    currentOrganisationStateSelector,
    ({ teams }) => teams,
);

export const teamsByIdSelector = createSelector(
    teamStateSelector,
    (teamsById) => teamsById,
);

export const teamsSelector = createSelector(
    teamsByIdSelector,
    (teamsById) => values(teamsById),
);

export const teamOptionsSelector = createSelector(
    teamsSelector,
    (teams) => teams.map(thingToOption),
);
