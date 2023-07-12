import { Reducer } from 'redux';

import { fetchTeamsSucceeded } from './actions';

export const teamsReducer: Reducer<Dict<Team>> = (state = {}, action) => {
    if (fetchTeamsSucceeded.matchAction(action)) {
        return {
            ...state,
            ...convertTeams(action.payload),
        };
    }
    return state;
};

function convertTeams(teams: ServerTeam[]) {
    let result: Dict<Team> = {};
    for (let team of teams) {
        result[team.id] = team;
    }
    return result;
}
