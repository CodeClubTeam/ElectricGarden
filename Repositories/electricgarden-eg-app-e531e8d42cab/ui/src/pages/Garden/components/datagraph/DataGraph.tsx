import moment from 'moment';
import React, { useReducer } from 'react';
import styled from 'styled-components/macro';

import { useSelectedGrowable } from '../../hooks';
import { getDefaultDateRangePreset } from './daterange/dateRangePresets';
import DateRangeSelector from './daterange/DateRangeSelector';
import { DynamicChart } from './DynamicChart';
import { SensorMetricToggles } from './measures/SensorMetricToggles';
import { SensorStatus } from './sensors/SensorStatus';
import {
    DataGraphDispatch,
    DataGraphState,
    dataReducer,
    initialState,
} from './state';

const ChartContainer = styled.div`
    border: 2px solid ${({ theme }) => theme.active};
    border-radius: 8px;
    margin-left: 1.5em;
    background-color: ${({ theme }) => theme.bg};
`;

const DateRangeAndSensorBlock = styled.div`
    margin-top: 1em;
    display: flex;
    justify-content: center;
`;

const DateRangeSelectorContainer = styled.div``;

const SensorStatusContainer = styled.div`
    padding-left: 3em;
`;

const MeasuresContainer = styled.div`
    margin-top: 1em;
    display: flex;
    justify-content: space-around;
`;

export const DataGraph: React.FC = () => {
    const growable = useSelectedGrowable();
    const { startDate, endDate } = getDefaultDateRangePreset({
        minDate: moment(growable.createdOn),
    });
    const [dataState, dataDispatch] = useReducer(dataReducer, {
        ...initialState,
        dateRange: {
            startDate,
            endDate,
        },
    });
    return (
        <DataGraphDispatch.Provider value={dataDispatch}>
            <DataGraphState.Provider value={dataState}>
                <ChartContainer>
                    <DynamicChart />
                </ChartContainer>
                <DateRangeAndSensorBlock>
                    <DateRangeSelectorContainer>
                        <DateRangeSelector />
                    </DateRangeSelectorContainer>
                    <SensorStatusContainer>
                        <SensorStatus />
                    </SensorStatusContainer>
                </DateRangeAndSensorBlock>
                <MeasuresContainer>
                    <SensorMetricToggles />
                </MeasuresContainer>
            </DataGraphState.Provider>
        </DataGraphDispatch.Provider>
    );
};
