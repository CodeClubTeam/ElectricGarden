import { sortBy } from 'lodash-es';
import { createSelector } from 'reselect';

import {
    currentOrganisationStateSelector,
    currentUserSelector,
} from '../../selectors';
import { createServerDataStateSelectors, thingToOption } from '../../utils';

const userStateSelector = createSelector(
    currentOrganisationStateSelector,
    ({ users }) => users,
);

const selectors = createServerDataStateSelectors(userStateSelector);

export const usersFetchStateSelector = selectors.fetchStateSelector;

export const usersSelector = selectors.items;

export const usersByIdSelector = selectors.itemsByKey;

export const userOptionsSelector = createSelector(usersSelector, (users) =>
    users.map(thingToOption),
);

export const usersSummarySelector = createSelector(usersSelector, (users) =>
    sortBy(users, 'name'),
);

export const userForIdOrUndefinedSelectorCreate = (userId: string) =>
    createSelector(usersByIdSelector, (usersById) => usersById[userId]);

export const userIdMatchesCurrentSelectorCreate = (userId: string) =>
    createSelector(currentUserSelector, (user): boolean => user.id === userId);
