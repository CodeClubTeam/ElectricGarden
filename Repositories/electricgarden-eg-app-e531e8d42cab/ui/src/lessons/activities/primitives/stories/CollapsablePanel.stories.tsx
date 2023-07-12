import React from 'react';
import { CollapsablePanel } from '../';

export const basic = () => (
    <CollapsablePanel heading="How are you?">
        Fine in the circumstances
    </CollapsablePanel>
);

export default {
    component: CollapsablePanel,
    title: 'CollapsablePanel',
};
