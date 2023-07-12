import { createAction, createPromiseAction } from 'redux-helper';
import getServer from '../../data/server';

export const fetchTeamsSucceeded = createAction<ServerTeam[]>(
    'FETCH_TEAMS_SUCCEEDED',
);

export const fetchTeams = createPromiseAction<
    string,
    ReturnType<typeof fetchTeamsSucceeded>['payload']
>(
    'FETCH_TEAMS',
    async (orgId) => {
        const result = await getServer().team.list(orgId);
        return result.items;
    },
    fetchTeamsSucceeded,
);
