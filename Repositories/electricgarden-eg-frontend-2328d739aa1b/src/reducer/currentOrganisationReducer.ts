import { Reducer, combineReducers } from 'redux';

import * as actions from '../actions';
import { dataReducer } from '../pages/Dashboard';
import { sensorsReducer, suSensorsReducer } from '../pages/Hardware';
import { teamsReducer } from '../pages/Teams';
import { usersReducer } from '../pages/Users';

const currentOrganisationIdReducer: Reducer<string | null> = (
    state = null,
    action,
) => {
    if (actions.setCurrentOrganisation.matchAction(action)) {
        return action.payload.id;
    }
    return state;
};

const organisationReducer = combineReducers({
    users: usersReducer,
    teams: teamsReducer,
    sensors: sensorsReducer,
    suSensors: suSensorsReducer,
    data: dataReducer,
});

const combinedReducer = combineReducers({
    id: currentOrganisationIdReducer,
    state: organisationReducer,
});

export const currentOrganisationReducer: Reducer<
    ReturnType<typeof combinedReducer>
> = (state, action) => {
    if (actions.setCurrentOrganisation.matchAction(action)) {
        // clear state as switched org
        return combinedReducer(undefined as any, action);
    }

    return combinedReducer(state, action);
};
