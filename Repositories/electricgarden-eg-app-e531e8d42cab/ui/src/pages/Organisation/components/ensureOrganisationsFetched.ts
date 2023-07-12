import { ensureFetched } from '../../../hocs/ensureFetched';
import * as actions from '../actions';
import { organisationsFetchStateSelector } from '../selectors';

export const ensureOrganisationsFetched = ensureFetched({
    fetchStateSelector: organisationsFetchStateSelector,
    fetch: actions.fetchOrganisations,
    waitMessage: 'Fetching organisations',
});
