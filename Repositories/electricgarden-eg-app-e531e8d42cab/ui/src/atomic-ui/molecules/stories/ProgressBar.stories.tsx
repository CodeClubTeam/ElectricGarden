import React from 'react';

import { ProgressBar } from '../';

export const zeroPercent = () => (
    <>
        <ProgressBar percent={0} />
    </>
);

export const fiftyPercent = () => (
    <>
        <ProgressBar percent={50} />
    </>
);

export const oneHundredPercent = () => (
    <>
        <ProgressBar percent={100} />
    </>
);

export default {
    component: ProgressBar,
    title: 'ProgressBar',
};
