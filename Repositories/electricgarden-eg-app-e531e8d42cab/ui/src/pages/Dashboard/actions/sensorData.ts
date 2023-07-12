import { createAction, createPromiseAction } from 'redux-helper';

import getServer from '../../../data/server';

export const fetchDataSucceeded = createAction<{
    sensorSerial: string;
    data: DataPoint[];
}>('FETCH_DATA_SUCCEEDED');

export const fetchDataFailed = createAction<{
    sensorSerial: string;
    error: Error;
}>('FETCH_DATA_FAILED');

export const fetchData = createPromiseAction<
    {
        orgId: string;
        sensorSerial: string;
        dateRange: DateRange;
    },
    ReturnType<typeof fetchDataSucceeded>['payload']
>(
    'FETCH_DATA',
    async (params) => {
        const { sensorSerial, dateRange, orgId } = params!;
        const { points } = await getServer(orgId).sensor.data.list(
            sensorSerial,
            dateRange,
        );
        return {
            sensorSerial,
            data: points,
        };
    },
    fetchDataSucceeded,
);
