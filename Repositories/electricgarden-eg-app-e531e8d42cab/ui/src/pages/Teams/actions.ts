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
        const result = await getServer(orgId!).team.list();
        return result.items;
    },
    fetchTeamsSucceeded,
);

export const updatedOrCreatedTeam = createAction<ServerTeam>(
    'UPDATED_OR_CREATED_TEAM',
);

export const removedTeam = createAction<string>('REMOVED_TEAM');
