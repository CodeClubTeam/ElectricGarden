import { createServerDataReducer } from '../../utils';
import * as actions from './actions';

export const usersReducer = createServerDataReducer(
    actions.fetchUsers,
    actions.fetchUsersSucceeded,
    {
        updatedOrCreatedAction: actions.updatedOrCreatedUser,
    },
);
