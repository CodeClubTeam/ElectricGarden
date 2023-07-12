import { createSelector } from 'reselect';

import {
    anyRequestsActiveSelectorCreator,
    currentOrganisationStateSelector,
} from '../../../selectors';
import { fetchData } from '../actions';

const dataStateSelector = createSelector(
    currentOrganisationStateSelector,
    ({ data }) => data,
);

export const dataSelector = createSelector(
    dataStateSelector,
    (data) => data,
);

export const dataFetchingSelector = anyRequestsActiveSelectorCreator(fetchData);
