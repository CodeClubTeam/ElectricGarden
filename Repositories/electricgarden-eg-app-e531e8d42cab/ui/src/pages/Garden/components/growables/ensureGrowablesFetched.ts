import { ensureFetchedForOrg } from '../../../../hocs/ensureFetched';
import * as actions from '../../actions';
import { growablesFetchStateSelector } from '../../selectors';

export const ensureGrowablesFetched = ensureFetchedForOrg({
    fetchStateSelector: growablesFetchStateSelector,
    fetch: actions.fetchGrowables,
    waitMessage: 'Fetching garden data',
});
