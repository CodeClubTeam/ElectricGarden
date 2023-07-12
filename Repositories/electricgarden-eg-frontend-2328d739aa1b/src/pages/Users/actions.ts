import { createAction, createPromiseAction } from 'redux-helper';

import getServer from '../../data/server';

export const fetchUsersSucceeded = createAction<ServerUser[]>(
    'FETCH_USERS_SUCCEEDED',
);

export const fetchUsers = createPromiseAction<
    string,
    ReturnType<typeof fetchUsersSucceeded>['payload']
>(
    'FETCH_USERS',
    async (orgId) => {
        const result = await getServer().user.list(orgId);
        return result.items;
    },
    fetchUsersSucceeded,
);
