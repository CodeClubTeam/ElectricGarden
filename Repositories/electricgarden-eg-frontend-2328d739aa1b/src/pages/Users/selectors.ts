import { values } from 'lodash';
import { createSelector } from 'reselect';

import { currentOrganisationStateSelector } from '../../selectors';
import { thingToOption } from '../../utils';

const userStateSelector = createSelector(
    currentOrganisationStateSelector,
    ({ users }) => users,
);

export const usersByIdSelector = createSelector(
    userStateSelector,
    (usersById) => usersById,
);

export const usersSelector = createSelector(
    usersByIdSelector,
    (usersById) => values(usersById),
);

export const userOptionsSelector = createSelector(
    usersSelector,
    (users) => users.map(thingToOption),
);
