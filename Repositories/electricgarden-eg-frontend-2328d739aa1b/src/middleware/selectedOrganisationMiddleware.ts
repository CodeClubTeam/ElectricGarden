import { Middleware } from 'redux';

import { setCurrentOrganisation } from '../actions';
import { setCurrentPagesOrganisation } from '../pages';

export const selectedOrganisationMiddleware: Middleware = ({ dispatch }) => (
    next,
) => (action) => {
    const result = next(action);

    if (setCurrentOrganisation.matchAction(action)) {
        const orgId = action.payload.id;
        setCurrentPagesOrganisation({ dispatch }, orgId);
    }

    return result;
};
