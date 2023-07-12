import { IPageManifest } from '../types';
import * as actions from './actions';

export * from './components/UserRoutes';
export * from './usersReducer';
export { usersSelector, userOptionsSelector } from './selectors';

export const manifest: IPageManifest = {
    setOrganisation: ({ dispatch }, orgId) => {
        dispatch(actions.fetchUsers(orgId));
    },
};
