import { useEffect, useState } from 'react';

import { useApi } from '../../../../data/ApiProvider';
import { dateRangeEquals } from '../../../../utils';
import { useSelectedGrowable } from '../../hooks';
import { useDataDispatch, useDataState } from './state';

export const useEnsurePointsFetched = () => {
    const growable = useSelectedGrowable();
    const api = useApi();
    const {
        data: { dateRange },
        dateRange: selectedDateRange,
    } = useDataState();
    const [fetching, setFetching] = useState(false);
    const dispatch = useDataDispatch();

    // expect data to reset when sensor id, or date range change
    useEffect(() => {
        // in future we'll do something smarter about minimal fetching
        // but we may minimise fetching horizontally as well as vertically so best leave this for now
        if (
            !dateRange ||
            !dateRangeEquals(selectedDateRange, dateRange, 'date')
        ) {
            const fetchDateRange = { ...selectedDateRange };
            setFetching(true);
            api.sensor.data
                .list(growable.sensorId, fetchDateRange)
                .then(({ sensor, points }) =>
                    dispatch({
                        type: 'DATA_RECEIVED',
                        payload: { sensor, points, dateRange: fetchDateRange },
                    }),
                )
                .finally(() => {
                    setFetching(false);
                });
        }
    }, [api.sensor.data, dateRange, dispatch, growable, selectedDateRange]);

    return {
        fetching,
    };
};
