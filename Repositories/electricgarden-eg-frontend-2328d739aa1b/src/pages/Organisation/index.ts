import { IPageManifest } from '../types';
import { fetchOrganisations } from './actions';

export * from './components/OrganisationRoutes';
export * from './organisationsReducer';
export {
    organisationsByIdSelector,
    organisationsFetchingSelector,
    organisationOptionsSelector,
} from './selectors';

export const manifest: IPageManifest = {
    init: ({ dispatch }) => {
        dispatch(fetchOrganisations());
    },
};
