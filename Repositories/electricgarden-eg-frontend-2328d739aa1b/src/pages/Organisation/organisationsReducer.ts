import { Reducer } from 'redux';

import { setCurrentOrganisation } from '../../actions';
import { fetchOrganisationsSucceeded } from './actions';

export const organisationsReducer: Reducer<Dict<ServerOrganisation>> = (
    state = {},
    action,
) => {
    if (fetchOrganisationsSucceeded.matchAction(action)) {
        return convertOrganisations(action.payload);
    } else if (setCurrentOrganisation.matchAction(action)) {
        const organisation = action.payload;
        return {
            ...state,
            ...convertOrganisations([organisation]),
        };
    }
    return state;
};

function convertOrganisations(organisations: ServerOrganisation[]) {
    let result: Dict<ServerOrganisation> = {};
    for (let organisation of organisations) {
        result[organisation.id] = organisation;
    }
    return result;
}
