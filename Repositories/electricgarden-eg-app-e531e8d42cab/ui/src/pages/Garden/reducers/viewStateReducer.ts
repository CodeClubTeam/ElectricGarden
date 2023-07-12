import { Reducer } from 'redux';
import * as commonActions from '../../../actions';
import * as actions from '../actions';
import { teamActions } from '../../../pages/Teams';

type GardenViewState = {
    selectedTeamId?: string;
};

export const viewStateReducer: Reducer<GardenViewState> = (
    state = {},
    action,
) => {
    if (commonActions.setGrower.matchAction(action)) {
        const { teams } = action.payload;
        // default to first team
        // NOTE: not much use if a team is deleted after load
        if (teams.length) {
            return {
                ...state,
                selectedTeamId: teams[0].id,
            };
        }
    } else if (actions.selectTeam.matchAction(action)) {
        const { id } = action.payload;
        return {
            ...state,
            selectedTeamId: id,
        };
    } else if (teamActions.updatedOrCreatedTeam.matchAction(action)) {
        const team = action.payload;
        if (!state.selectedTeamId) {
            return {
                ...state,
                selectedTeamId: team.id,
            };
        }
    } else if (teamActions.removedTeam.matchAction(action)) {
        const teamId = action.payload;
        if (state.selectedTeamId === teamId) {
            return {
                ...state,
                selectedTeamId: undefined,
            };
        }
    }
    return state;
};
