import { createAction, createPromiseAction } from 'redux-helper';

import getServer from '../../../data/server';

export const fetchDataSucceeded = createAction<{
    sensorSerial: string;
    data: ServerDataPoint[];
}>('FETCH_DATA_SUCCEEDED');

export const fetchDataFailed = createAction<{
    sensorSerial: string;
    error: Error;
}>('FETCH_DATA_FAILED');

export const fetchData = createPromiseAction<
    {
        sensorSerial: string;
        dateRange: any;
    },
    ReturnType<typeof fetchDataSucceeded>['payload']
>(
    'FETCH_DATA',
    async (params) => {
        const { sensorSerial, dateRange } = params!;
        const data = await getServer().sensor.data.list(
            sensorSerial,
            dateRange,
        );
        return {
            sensorSerial,
            data,
        };
    },
    fetchDataSucceeded,
);
