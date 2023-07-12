import { Reducer } from 'redux';

import { fetchSuSensorsSucceeded } from '../actions';

export const suSensorsReducer: Reducer<Dict<Sensor>> = (state = {}, action) => {
    if (fetchSuSensorsSucceeded.matchAction(action)) {
        return convertSensors(action.payload);
    }

    return state;
};

function convertSensors(sensors: ServerSuperUserSensor[]) {
    let result: Dict<Sensor> = {};
    for (let sensor of sensors) {
        result[sensor.serial] = {
            id: sensor._id,
            name: sensor.friendlyName,
            organisationId: sensor.organisationId,
            serial: sensor.serial,
        };
    }
    return result;
}
