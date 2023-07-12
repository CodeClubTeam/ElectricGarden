import { ensureFetchedForOrg } from '../../../hocs/ensureFetched';
import * as actions from '../actions';
import { usersFetchStateSelector } from '../selectors';

export const ensureUsersFetched = ensureFetchedForOrg({
    fetchStateSelector: usersFetchStateSelector,
    fetch: actions.fetchUsers,
    waitMessage: 'Fetching users',
});
