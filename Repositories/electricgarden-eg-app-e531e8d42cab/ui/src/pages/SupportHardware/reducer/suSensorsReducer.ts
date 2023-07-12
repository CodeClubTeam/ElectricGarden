import { createServerDataReducer } from '../../../utils';
import * as actions from '../actions';

export const suSensorsReducer = createServerDataReducer<
    SuperUserSensor,
    Sensor
>(actions.fetchSuSensors, actions.fetchSuSensorsSucceeded, {
    lookupKeySelector: (sensor) => sensor.serial,
    valueProjector: ({
        id,
        friendlyName,
        organisationId,
        serial,
        readingStats,
    }) => ({
        id,
        name: friendlyName,
        organisationId,
        serial,
        readingStats,
    }),
    updatedOrCreatedAction: actions.suSensorUpdatedOrCreated,
});
