import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

import moment from 'moment';
import React, { useState } from 'react';
import { DateRangePicker, isInclusivelyBeforeDay } from 'react-dates';
import styled from 'styled-components/macro';

const Container = styled.div`
    background-color: #d4edd1;
    width: 300px;
    margin: 0 40px 10px 40px;
    padding: 1px 0;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    grid-column: 1;
    grid-row: 1;
`;

const ContentContainer = styled.div`
    padding: 10px 0;
    font-size: 18px;
    font-weight: bold;
`;

interface Props {
    value: NullableDateRange;
    onChange: (value: NullableDateRange) => void;
}

type FocusedInput = keyof DateRange | null;

export const DateSelection: React.FC<Props> = ({ value, onChange }) => {
    const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);
    return (
        <Container>
            <ContentContainer>
                <p>Select Data Date Range:</p>
                <DateRangePicker
                    isOutsideRange={(day) =>
                        !isInclusivelyBeforeDay(day, moment())
                    }
                    startDate={value.startDate}
                    startDateId="startDateIdChart"
                    endDate={value.endDate}
                    endDateId="endDateIdChart"
                    onDatesChange={onChange}
                    focusedInput={focusedInput}
                    onFocusChange={setFocusedInput}
                    displayFormat="D/MM/YYYY"
                    hideKeyboardShortcutsPanel
                    readOnly={true}
                />
            </ContentContainer>
        </Container>
    );
};
