import { Reducer } from 'redux';

import { fetchUsersSucceeded } from './actions';

export const usersReducer: Reducer<Dict<ServerUser>> = (state = {}, action) => {
    if (fetchUsersSucceeded.matchAction(action)) {
        return convertUsers(action.payload);
    }

    return state;
};

function convertUsers(users: ServerUser[]) {
    let result: Dict<User> = {};
    for (let user of users) {
        result[user.id] = {
            ...user,
            teams: user.teams || [],
        };
    }
    return result;
}
