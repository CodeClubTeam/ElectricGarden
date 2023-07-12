import { createServerDataReducer } from '../../../utils';
import * as actions from '../actions';

export const sensorsReducer = createServerDataReducer(
    actions.fetchSensors,
    actions.fetchSensorsSucceeded,
    {
        lookupKeySelector: (sensor) => sensor.serial,
        updatedOrCreatedAction: actions.sensorUpdatedOrCreated,
    },
);
