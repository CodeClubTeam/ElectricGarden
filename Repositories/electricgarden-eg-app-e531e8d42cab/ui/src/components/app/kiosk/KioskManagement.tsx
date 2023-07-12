import React, { useState } from 'react';
import { KioskIdle } from './KioskIdle';
import { KioskWelcome } from './KioskWelcome';

export const KioskManagement: React.FC = () => {
    const [showWelcome, setShowWelcome] = useState(true);
    return (
        <>
            <KioskWelcome show={showWelcome} onShowChange={setShowWelcome} />
            <KioskIdle onReset={() => setShowWelcome(true)} />
        </>
    );
};
