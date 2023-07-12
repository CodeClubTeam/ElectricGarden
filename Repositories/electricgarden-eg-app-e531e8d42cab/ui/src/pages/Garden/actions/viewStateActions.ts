import { createAction } from 'redux-helper';

export const selectTeam = createAction<{ id: string }>('SELECT_TEAM');
