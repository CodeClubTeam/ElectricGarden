import React from 'react';

import { DateRangeSelector } from '../DateRangeSelector';
import { getDateRangePresets } from '../dateRangePresets';
import { action } from '@storybook/addon-actions';

const presets = getDateRangePresets();

export const firstSelected = () => (
    <DateRangeSelector
        selectedRange={presets[0]}
        onSelect={action('selected')}
    />
);

export const middleSelected = () => (
    <DateRangeSelector
        selectedRange={presets[1]}
        onSelect={action('selected')}
    />
);

export const lastSelected = () => (
    <DateRangeSelector
        selectedRange={presets[presets.length - 1]}
        onSelect={action('selected')}
    />
);

export default {
    component: DateRangeSelector,
    title: 'DateRangeSelector',
};
