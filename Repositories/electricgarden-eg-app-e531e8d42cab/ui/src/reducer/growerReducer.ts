import { Reducer } from 'redux';

import * as actions from '../actions';
import { teamActions } from '../pages/Teams';

export const growerReducer: Reducer<ServerGrower | null> = (
    state = null,
    action,
) => {
    if (actions.setGrower.matchAction(action)) {
        return action.payload;
    } else if (teamActions.updatedOrCreatedTeam.matchAction(action)) {
        const team = action.payload;
        const grower = state;
        if (grower) {
            const existing = grower.teams.find((t) => t.id === team.id);
            if (existing) {
                return {
                    ...grower,
                    teams: grower.teams.map((t) =>
                        t.id === team.id ? team : t,
                    ),
                };
            } else {
                return {
                    ...grower,
                    teams: [...grower.teams, team],
                };
            }
        }
    } else if (teamActions.removedTeam.matchAction(action)) {
        const teamId = action.payload;
        const grower = state;
        if (grower) {
            return {
                ...grower,
                teams: grower.teams.filter((t) => t.id !== teamId),
            };
        }
    }
    return state;
};
