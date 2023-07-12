import { useState, useEffect } from 'react';
import { useApi } from '../../../data/ApiProvider';

export const useFetchSensors = () => {
    const [fetchStatus, setFetchStatus] = useState<
        'fetching' | 'fetched' | undefined
    >();
    const [values, setValues] = useState<ServerSensor[]>([]);

    const api = useApi();
    useEffect(() => {
        if (fetchStatus === undefined) {
            setFetchStatus('fetching');
            api.sensor.list().then((sensors) => {
                setFetchStatus('fetched');
                setValues(sensors.items);
            });
        }
    }, [api, api.sensor, fetchStatus]);

    return { fetching: fetchStatus !== 'fetched', values };
};
