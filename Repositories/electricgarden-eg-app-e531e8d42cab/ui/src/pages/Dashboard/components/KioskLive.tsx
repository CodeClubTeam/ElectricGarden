import React from 'react';
import { PageHeader, PageContent } from '../../../atomic-ui';
import { KioskContent } from './kiosk/KioskContent';

export const KioskLive = () => (
    <>
        <PageHeader>
            <h1>Live</h1>
        </PageHeader>
        <PageContent>
            <KioskContent />
        </PageContent>
    </>
);
