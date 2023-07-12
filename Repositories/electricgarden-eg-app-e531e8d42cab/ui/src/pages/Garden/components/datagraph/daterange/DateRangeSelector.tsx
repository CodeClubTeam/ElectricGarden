import React from 'react';

import { useDataDispatch, useDataState } from '../state';
import { getDateRangePresets } from './dateRangePresets';
import { DateRangeToggleButton } from './DateRangeToggleButton';

type Props = {
    selectedRange: DateRange;
    onSelect: (range: DateRange) => void;
};

export const DateRangeSelector: React.FC<Props> = ({
    selectedRange,
    onSelect,
}) => {
    const dateRangePresets = getDateRangePresets();

    const isSelected = ({ startDate, endDate }: DateRange) =>
        startDate.isSame(selectedRange.startDate, 'hour') &&
        endDate.isSame(selectedRange.endDate, 'hour');

    return (
        <div>
            {dateRangePresets.map((range) => (
                <DateRangeToggleButton
                    key={range.name}
                    group="dateRange"
                    preset={range}
                    selected={isSelected(range)}
                    onSelect={() => onSelect(range)}
                />
            ))}
        </div>
    );
};

const DateRangeSelectorConnected = () => {
    const dispatch = useDataDispatch();
    const { dateRange } = useDataState();

    return (
        <DateRangeSelector
            selectedRange={dateRange}
            onSelect={(range) =>
                dispatch({ type: 'SET_DATE_RANGE', payload: range })
            }
        />
    );
};

export default DateRangeSelectorConnected;
