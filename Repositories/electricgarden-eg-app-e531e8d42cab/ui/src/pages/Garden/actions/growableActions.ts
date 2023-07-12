import { createAction, createPromiseAction } from 'redux-helper';
import getServer from '../../../data/server';

export const fetchGrowablesSucceeded = createAction<ServerGrowable[]>(
    'FETCH_GROWABLES_SUCCEEDED',
);

// note that all growables for the org are fetched
// we filter on the ui side but in future we should consider filtering for team
export const fetchGrowables = createPromiseAction<
    string,
    ReturnType<typeof fetchGrowablesSucceeded>['payload']
>(
    'FETCH_GROWABLES',
    async (orgId) => {
        const result = await getServer(orgId!).growables.list();
        return result.items;
    },
    fetchGrowablesSucceeded,
);

export const updatedOrCreatedGrowable = createAction<ServerGrowable>(
    'UPDATED_OR_CREATED_GROWABLE',
);

export const removedGrowable = createAction<string>('REMOVED_GROWABLE');
