import { ensureFetchedForOrg } from '../../../hocs/ensureFetched';
import * as actions from '../actions';
import { teamsFetchStateSelector } from '../selectors';

export const ensureTeamsFetched = ensureFetchedForOrg({
    fetchStateSelector: teamsFetchStateSelector,
    fetch: actions.fetchTeams,
    waitMessage: 'Fetching teams',
});
