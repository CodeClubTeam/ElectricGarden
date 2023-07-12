import { createAction } from 'redux-helper';

export const setCurrentOrganisation = createAction<ServerOrganisation>(
    'SET_CURRENT_ORGANISATION',
);

export const setCurrentUser = createAction<ServerUser>('SET_USER');
