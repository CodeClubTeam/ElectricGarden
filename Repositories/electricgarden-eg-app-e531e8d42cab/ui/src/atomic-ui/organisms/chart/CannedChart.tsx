import React from 'react';
import styled from 'styled-components/macro';

import { Chart, VisibleChartItems, ChartProps } from '../..';
import { cleanDataPoint } from '../../../utils/dataPoints';

type Props = {
    data: {
        points: ServerDataPoint[];
    };
    show?: Array<keyof VisibleChartItems>;
} & Omit<ChartProps, 'data' | 'items'>;

const Container = styled.div`
    height: 300px;
`;

const defaultShow: Props['show'] = ['airTemp', 'soilTemp', 'soilMoisture'];

export const CannedChart: React.FC<Props> = ({
    data: serverData,
    show = defaultShow,
    ...chartProps
}) => {
    const data = serverData.points.map(cleanDataPoint);
    const items = show.reduce(
        (result, name) => {
            result[name] = true;
            return result;
        },
        {} as VisibleChartItems,
    );
    return (
        <Container>
            <Chart {...chartProps} data={data} items={items} />
        </Container>
    );
};
