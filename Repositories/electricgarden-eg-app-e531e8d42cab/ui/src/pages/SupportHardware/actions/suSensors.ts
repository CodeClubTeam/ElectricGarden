import { createAction, createPromiseAction } from 'redux-helper';

import getServer from '../../../data/server';

export const fetchSuSensorsSucceeded = createAction<SuperUserSensor[]>(
    'FETCH_SU_SENSORS_SUCCEEDED',
);

export const fetchSuSensors = createPromiseAction<
    {},
    ReturnType<typeof fetchSuSensorsSucceeded>['payload']
>(
    'FETCH_SU_SENSORS',
    async () => {
        const result = await getServer().sensor.listAll();
        return result.items;
    },
    fetchSuSensorsSucceeded,
);

export const suSensorUpdatedOrCreated = createAction<SuperUserSensor>(
    'SU_SENSOR_UPDATED_OR_CREATED',
);
