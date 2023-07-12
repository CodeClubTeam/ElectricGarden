import React from 'react';
import styled from 'styled-components/macro';

import { DateRange } from '../../shared/dateRange';
import { useDataDispatch, useDataState } from '../state';
import { getDateRangePresets } from './dateRangePresets';
import { DateRangeToggleButton } from './DateRangeToggleButton';

type Props = {
  selectedRange: DateRange;
  onSelect: (range: DateRange) => void;
};

const Container = styled.div`
  overflow-wrap: initial; // stops buttons wrapping on firefox
`;

const DateRangeSelectorComponent: React.FC<Props> = ({
  selectedRange,
  onSelect,
}) => {
  const dateRangePresets = getDateRangePresets();

  const isSelected = ({ startDate, endDate }: DateRange) =>
    startDate.isSame(selectedRange.startDate, "hour") &&
    endDate.isSame(selectedRange.endDate, "hour");

  return (
    <Container>
      {dateRangePresets.map((range) => (
        <DateRangeToggleButton
          key={range.name}
          group="dateRange"
          preset={range}
          selected={isSelected(range)}
          onSelect={() => onSelect(range)}
        />
      ))}
    </Container>
  );
};

export const DateRangeSelector = () => {
  const dispatch = useDataDispatch();
  const { dateRange } = useDataState();

  return (
    <DateRangeSelectorComponent
      selectedRange={dateRange}
      onSelect={(range) => dispatch({ type: "SET_DATE_RANGE", payload: range })}
    />
  );
};
