import { useQuery } from 'react-query';

import { useApi } from '../../../../data/ApiProvider';
import moment from 'moment';

type Criteria = {
    startDate?: moment.Moment;
    endDate?: moment.Moment;
    limit?: number;
};

export const useFetchLiveSensorData = (
    serial: string,
    criteria: Criteria = {
        startDate: moment().subtract(10, 'minutes').startOf('minute'),
    },
) => {
    const api = useApi();
    return useQuery(
        ['sensor-data', serial, criteria],
        () => api.sensor.data.list(serial, criteria),
        {
            refetchInterval: 5 * 1000,
            refetchIntervalInBackground: false,
        },
    );
};
