import React, { useCallback, useState } from 'react';

import { Button } from '../../../../atomic-ui';
import { useApi } from '../../../../data/ApiProvider';
import { useFetchLiveSensorData } from './useFetchLiveSensorData';

type Props = {
    serial: string;
};

export const ResetButton = ({ serial }: Props) => {
    const api = useApi();
    const [resetting, setResetting] = useState(false);
    const { refetch, remove: clear } = useFetchLiveSensorData(serial);

    const handleReset = useCallback(() => {
        setResetting(true);
        api.sensor.data
            .resetLiveData(serial)
            .then(() => {
                clear();
                refetch();
            })
            .finally(() => {
                setResetting(false);
            });
    }, [api.sensor.data, clear, refetch, serial]);

    return (
        <Button onClick={handleReset} disabled={resetting}>
            {resetting ? 'Resetting...' : 'Reset'}
        </Button>
    );
};
