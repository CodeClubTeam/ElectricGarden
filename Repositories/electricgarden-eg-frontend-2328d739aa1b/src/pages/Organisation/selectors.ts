import { values } from 'lodash';
import { createSelector } from 'reselect';

import { AppState } from '../../types';
import { anyRequestsActiveSelectorCreator } from '../../selectors';
import * as actions from './actions';
import { thingToOption } from '../../utils';

const organisationsStateSelector = (state: AppState) => state.organisations;

export const organisationsByIdSelector = createSelector(
    organisationsStateSelector,
    (organisationsById) => organisationsById,
);

export const organisationsSelector = createSelector(
    organisationsByIdSelector,
    (organisationsById) => values(organisationsById),
);

export const organisationsFetchingSelector = anyRequestsActiveSelectorCreator(
    actions.fetchOrganisations,
);

export const organisationOptionsSelector = createSelector(
    organisationsSelector,
    (organisations) => organisations.map(thingToOption),
);
