import { createServerDataReducer } from '../../utils';
import * as actions from './actions';

export const organisationsReducer = createServerDataReducer(
    actions.fetchOrganisations,
    actions.fetchOrganisationsSucceeded,
    {
        updatedOrCreatedAction: actions.updatedOrCreatedOrganisation,
    },
);
