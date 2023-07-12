import { ensureFetched } from '../../../hocs/ensureFetched';
import * as actions from '../actions';
import { suSensorsFetchStateSelector } from '../selectors';

export const ensureSuSensorsFetched = ensureFetched({
    fetchStateSelector: suSensorsFetchStateSelector,
    fetch: actions.fetchSuSensors,
    waitMessage: 'Fetching sensors',
});
