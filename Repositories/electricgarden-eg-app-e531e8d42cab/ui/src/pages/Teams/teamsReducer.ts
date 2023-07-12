import { createServerDataReducer } from '../../utils';
import * as actions from './actions';

export const teamsReducer = createServerDataReducer(
    actions.fetchTeams,
    actions.fetchTeamsSucceeded,
    {
        updatedOrCreatedAction: actions.updatedOrCreatedTeam,
        deletedAction: actions.removedTeam,
    },
);
