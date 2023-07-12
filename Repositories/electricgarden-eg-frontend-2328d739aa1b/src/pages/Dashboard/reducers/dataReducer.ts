import { Reducer } from 'redux';

import { fetchData, fetchDataSucceeded } from '../actions';

export const dataReducer: Reducer<Dict<DataPoint[]>> = (state = {}, action) => {
    if (fetchDataSucceeded.matchAction(action)) {
        const { sensorSerial, data } = action.payload;
        return {
            ...state,
            [sensorSerial]: cleanData(data),
        };
    } else if (fetchData.matchOnError(action)) {
        const { sensorSerial } = action.promiseActionParams!;
        return {
            ...state,
            [sensorSerial]: [],
        };
    }

    return state;
};

function cleanData(data: ServerDataPoint[]): DataPoint[] {
    return data.map(cleanDataPoint).sort((a, b) => a.timestamp - b.timestamp);
}

function cleanDataPoint(dataPoint: ServerDataPoint): DataPoint {
    return {
        timestamp: dataPoint.timestampSeconds * 1000,
        ambient_humidity: nullEmpty(dataPoint.readings.ambient_humidity),
        light_sensor: cleanLux(dataPoint.readings.light_sensor),
        probe_air_temp: nullEmpty(dataPoint.readings.probe_air_temp),
        probe_moisture: nullEmpty(dataPoint.readings.probe_moisture),
        probe_soil_temp: nullEmpty(dataPoint.readings.probe_soil_temp),
        battery_voltage: nullEmpty(dataPoint.readings.battery_voltage),
    };
}

function nullEmpty(a: number | null | undefined): number | null {
    return a != null ? a : null;
}

const LUX_SATURATED = -1;
const LUX_DARK = -2;
const LUX_MINIMUM = 1;
const LUX_MAXIMUM = 64000;
function cleanLux(lux: number | null | undefined) {
    if (lux === undefined || lux === null) {
        return null;
    } else if (lux === LUX_SATURATED) {
        return LUX_MAXIMUM;
    } else if (lux === LUX_DARK || lux <= LUX_MINIMUM) {
        return LUX_MINIMUM;
    }
    return lux;
}
