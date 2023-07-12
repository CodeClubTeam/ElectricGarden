import { createSelector } from 'reselect';
import {
    currentOrganisationStateSelector,
    growerTeamsSelector,
} from '../../../selectors';
import { makeMandatorySelector } from '../../../utils';

const viewStateSelector = createSelector(
    currentOrganisationStateSelector,
    (state) => state.garden.viewState,
);

export const selectedTeamOrUndefinedSelector = createSelector(
    viewStateSelector,
    growerTeamsSelector,
    ({ selectedTeamId }, teams) =>
        teams.find((team) => team.id === selectedTeamId),
);

export const selectedTeamSelector = makeMandatorySelector(
    selectedTeamOrUndefinedSelector,
);

export const selectedTeamIdSelector = createSelector(
    selectedTeamSelector,
    (team) => team.id,
);
