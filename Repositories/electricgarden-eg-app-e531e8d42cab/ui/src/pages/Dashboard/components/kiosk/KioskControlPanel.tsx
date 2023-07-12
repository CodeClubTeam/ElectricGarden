import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';

import { Measure, VisibleChartItems } from '../../../../atomic-ui';
import { sensorMetricsExcludingAdminSelector } from '../../../../metrics';
import { MeasureToggles } from './MeasureToggles';
import { ResetButton } from './ResetButton';
import { MeasureValue } from './MeasureValue';

type Props = {
    serial: string;
    chartItems: VisibleChartItems;
    onChartItemsChanged: (items: VisibleChartItems) => void;
    latestDataPoint?: DataPoint;
};

const Container = styled.div`
    grid-column: 1;
    grid-row: 2;
    margin: 0 40px 10px 40px;
`;

const MetricsContainer = styled.div`
    padding: 0.5em 0;
    max-width: 100px;
`;

const ResetContainer = styled.div`
    padding: 0.5em 0;
    margin: auto;
`;

export const KioskControlPanel = ({
    serial,
    chartItems,
    onChartItemsChanged,
    latestDataPoint,
}: Props) => {
    const metrics = useSelector(sensorMetricsExcludingAdminSelector).filter(
        (m) => m.type !== 'light',
    );
    const latestMeasures: Measure[] = metrics.map(
        (metric): Measure => ({
            metric,
            value: latestDataPoint ? latestDataPoint[metric.reading] : null,
        }),
    );
    return (
        <Container>
            <MetricsContainer>
                <MeasureToggles
                    value={chartItems}
                    onChange={onChartItemsChanged}
                    latestMeasures={latestMeasures}
                    valueComponent={MeasureValue}
                />
            </MetricsContainer>
            <ResetContainer>
                <ResetButton serial={serial} />
            </ResetContainer>
        </Container>
    );
};
