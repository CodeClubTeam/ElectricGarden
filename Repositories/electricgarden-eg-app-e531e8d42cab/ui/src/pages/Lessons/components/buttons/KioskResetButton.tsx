import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '../../../../atomic-ui';

export const KioskResetButton: React.FC = () => {
    const history = useHistory();
    const resetKiosk = async () => {
        await history.push('/garden');
        window.location.reload();
    };
    return <Button onClick={resetKiosk}>Reset</Button>;
};
