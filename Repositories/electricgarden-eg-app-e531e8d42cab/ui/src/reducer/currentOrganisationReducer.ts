import { combineReducers, Reducer } from 'redux';

import * as actions from '../actions';
import { dataReducer, viewReducer } from '../pages/Dashboard';
import { gardenReducer } from '../pages/Garden';
import { sensorsReducer } from '../pages/Hardware';
import { teamsReducer } from '../pages/Teams';
import { usersReducer } from '../pages/Users';

const currentOrganisationIdReducer: Reducer<string | null> = (
    state = null,
    action,
) => {
    if (actions.setGrower.matchAction(action)) {
        return action.payload.organisation.id;
    }
    return state;
};

const currentOrganisationNameReducer: Reducer<string | null> = (
    state = null,
    action,
) => {
    if (actions.setGrower.matchAction(action)) {
        return action.payload.organisation.name;
    }
    return state;
};

const currentOrganisationModeReducer: Reducer<
    ServerOrganisation['mode'] | null
> = (state = null, action) => {
    if (actions.setGrower.matchAction(action)) {
        return action.payload.organisation.mode;
    }
    return state;
};

const organisationStateReducer = combineReducers({
    users: usersReducer,
    teams: teamsReducer,
    sensors: sensorsReducer,
    data: dataReducer,
    view: viewReducer,
    garden: gardenReducer,
});

const combinedReducer = combineReducers({
    id: currentOrganisationIdReducer,
    name: currentOrganisationNameReducer,
    mode: currentOrganisationModeReducer,
    state: organisationStateReducer,
});

export const currentOrganisationReducer: Reducer<ReturnType<
    typeof combinedReducer
>> = (state, action) => {
    if (actions.setGrower.matchAction(action)) {
        // clear state as potentially switched org
        return combinedReducer(undefined as any, action);
    }

    return combinedReducer(state, action);
};
