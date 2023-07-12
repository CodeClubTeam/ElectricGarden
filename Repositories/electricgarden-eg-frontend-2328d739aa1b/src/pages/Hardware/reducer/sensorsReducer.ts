import { Reducer } from 'redux';

import { fetchSensorsSucceeded } from '../actions';

export const sensorsReducer: Reducer<Dict<Sensor>> = (state = {}, action) => {
    if (fetchSensorsSucceeded.matchAction(action)) {
        return convertSensors(action.payload);
    }

    return state;
};

function convertSensors(sensors: ServerSensor[]) {
    let result: Dict<Sensor> = {};
    for (let sensor of sensors) {
        result[sensor.serial] = sensor;
    }
    return result;
}
