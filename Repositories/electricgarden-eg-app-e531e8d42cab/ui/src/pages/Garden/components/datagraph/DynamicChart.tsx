import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { VictoryScatter, VictoryTooltip } from 'victory';

import { Chart } from '../../../../atomic-ui/organisms';
import { formatDateTime } from '../../../../utils';
import { useSelectedGrowable } from '../../hooks';
import { observationDataSelectorCreate } from '../../selectors';
import { DataItem } from '../../types';
import { DynaPoint } from './DynaPoint';
import { useDataState } from './state';
import { useEnsurePointsFetched } from './useEnsurePointsFetched';

const Container = styled.div`
    --chart-width: 45vw;
    --chart-width-max: 700px;
    @media (max-width: 1023px) {
        --chart-width: 95vw;
    }
    width: var(--chart-width);
    max-width: var(--chart-width-max);
    height: calc(var(--chart-width) * 0.66);
    max-height: calc(var(--chart-width-max) * 0.66);
`;

export const DynamicChart: React.FC = () => {
    const {
        chartItems: chartConfig,
        dateRange,
        data: { points },
    } = useDataState();
    const { fetching } = useEnsurePointsFetched();
    const growable = useSelectedGrowable();
    const observationItems = useSelector(
        observationDataSelectorCreate(growable.id, dateRange),
    );

    const color = 'purple';

    // shoving into children for now.
    // to be data driven at a later date I think
    return (
        <Container>
            <Chart
                items={chartConfig}
                data={points}
                fetching={fetching}
                dateRange={dateRange}
            >
                <VictoryScatter
                    data={observationItems}
                    labels={({ datum: { type, timestamp } }: DataItem) =>
                        `${type}: ${formatDateTime(timestamp)}` || ''
                    }
                    labelComponent={<VictoryTooltip />}
                    x="timestamp"
                    y="value"
                    size={4}
                    dataComponent={<DynaPoint />}
                    style={{
                        data: {
                            fill: 'white',
                            stroke: color,
                            strokeWidth: 2,
                        },
                        labels: {
                            fontSize: '24px',
                            fill: color,
                        },
                    }}
                />
            </Chart>
        </Container>
    );
};
