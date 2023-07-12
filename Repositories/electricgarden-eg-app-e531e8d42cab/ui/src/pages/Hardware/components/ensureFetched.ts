import { ensureFetchedForOrg } from '../../../hocs/ensureFetched';
import { useEnsureFetchedForOrg } from '../../../hooks/useEnsureFetched';
import * as actions from '../actions';
import { sensorsFetchStateSelector } from '../selectors';

export const ensureSensorsFetched = ensureFetchedForOrg({
    fetchStateSelector: sensorsFetchStateSelector,
    fetch: actions.fetchSensors,
    waitMessage: 'Fetching sensors',
});

export const useEnsureSensorsFetched = () =>
    useEnsureFetchedForOrg({
        fetchStateSelector: sensorsFetchStateSelector,
        fetch: actions.fetchSensors,
    });
