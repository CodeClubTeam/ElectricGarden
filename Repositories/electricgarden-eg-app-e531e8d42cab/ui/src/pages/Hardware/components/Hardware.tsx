import React from 'react';

import { PageHeader, Section } from '../../../components/common';
import { HardwareTable } from './HardwareTable';
import hardwareIcon from '../../../static/egdevice.svg';

export const Hardware: React.FC = () => {
    return (
        <div>
            <PageHeader>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    <img
                        style={{ margin: '-5px -5px 0 0' }}
                        src={hardwareIcon}
                        alt={'My Devices'}
                    />
                    <h2>Devices</h2>
                </div>
            </PageHeader>
            <Section header="Device details">
                <HardwareTable />
            </Section>
        </div>
    );
};
