import moment from 'moment';

export type DateRangePreset = {
    title: string;
    name: string;
} & DateRange;

type PresetOptions = {
    minDate?: moment.Moment;
};

export const getDateRangePresets = ({
    minDate,
}: PresetOptions = {}): DateRangePreset[] => [
    {
        name: 'alltime',
        title: 'All time',
        startDate: minDate ? minDate : moment().subtract(1, 'years'),
        endDate: moment(),
    },
    {
        name: 'month',
        title: 'month',
        startDate: moment().subtract(1, 'month'),
        endDate: moment(),
    },
    {
        name: 'week',
        title: 'week',
        startDate: moment().subtract(1, 'weeks'),
        endDate: moment(),
    },
    {
        name: 'day',
        title: 'day',
        startDate: moment().startOf('day'),
        endDate: moment(),
    },
];

export const getDefaultDateRangePreset = (options: PresetOptions = {}) => {
    const presets = getDateRangePresets(options);
    const defaultPreset = presets.find(({ name }) => name === 'week');
    if (!defaultPreset) {
        throw new Error('Default date range preset not found.');
    }
    return defaultPreset;
};
