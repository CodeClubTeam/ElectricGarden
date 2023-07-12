import { useState, useEffect } from 'react';
import { useApi } from '../../../data/ApiProvider';

export const useFetchGrowableTypes = () => {
    const [fetchStatus, setFetchStatus] = useState<
        'fetching' | 'fetched' | undefined
    >();
    const [values, setValues] = useState<ServerGrowableType[]>([]);

    const api = useApi();
    useEffect(() => {
        if (fetchStatus === undefined) {
            setFetchStatus('fetching');
            api.growableTypes.list().then((types) => {
                setFetchStatus('fetched');
                setValues(types);
            });
        }
    }, [api.growableTypes, fetchStatus]);

    return { fetching: fetchStatus !== 'fetched', values };
};
