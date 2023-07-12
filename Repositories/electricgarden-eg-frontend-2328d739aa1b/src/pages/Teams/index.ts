import { IPageManifest } from '../types';
import * as actions from './actions';

export * from './teamsReducer';
export * from './components/TeamRoutes';
export { teamsSelector, teamOptionsSelector } from './selectors';

export const manifest: IPageManifest = {
    setOrganisation: ({ dispatch }, orgId) => {
        dispatch(actions.fetchTeams(orgId));
    },
};
