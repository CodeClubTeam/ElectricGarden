import { createAction, createPromiseAction } from 'redux-helper';

import getServer from '../../../data/server';

export const fetchSensorsSucceeded = createAction<ServerSensor[]>(
    'FETCH_SENSORS_SUCCEEDED',
);

export const fetchSensors = createPromiseAction<string, ServerSensor[]>(
    'FETCH_SENSORS',
    async (orgId) => {
        const list = await getServer(orgId!).sensor.list();
        return list.items;
    },
    fetchSensorsSucceeded,
);

export const sensorUpdatedOrCreated = createAction<ServerSensor>(
    'SENSOR_UPDATED_OR_CREATED',
);
