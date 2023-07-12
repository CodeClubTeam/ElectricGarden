import { IPageManifest } from '../types';
import * as actions from './actions';

export * from './components/HardwareRoutes';
export * from './reducer';
export {
    sensorsSelector,
    sensorOptionsSelector,
    sensorsFetchingSelector,
} from './selectors';

export const manifest: IPageManifest = {
    setOrganisation: ({ dispatch }, orgId) => {
        dispatch(actions.fetchSensors(orgId));
    },
};
