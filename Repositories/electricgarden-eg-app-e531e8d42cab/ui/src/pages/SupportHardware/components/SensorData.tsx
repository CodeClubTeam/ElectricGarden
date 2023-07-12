import moment from 'moment';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';

import {
    Chart,
    VisibleChartItems,
    SensorMetricsSelector,
} from '../../../atomic-ui';
import { useApi } from '../../../data/ApiProvider';

type Props = {
    serial: string;
};

type FetchStatus = 'fetching' | 'fetched' | 'errored';

const useSensorDataFetch = (serial: string) => {
    const api = useApi();
    const [data, setData] = useState<DataPoint[]>([]);
    const [fetchStatus, setFetchStatus] = useState<FetchStatus>();
    useEffect(() => {
        const fetchData = async () => {
            setFetchStatus('fetching');
            try {
                const result = await api.sensor.data.list(serial, {
                    startDate: moment().subtract(2, 'months'),
                });
                setData(result.points);
                setFetchStatus('fetched');
            } catch (err) {
                setFetchStatus('errored');
            }
        };
        fetchData();
    }, [api.sensor.data, serial]);

    return {
        fetchStatus,
        data,
    };
};

const Container = styled.div`
    display: flex;
`;

const ChartContainer = styled.div`
    border: 2px solid #a7a9ab;
    border-radius: 8px;
    flex: 1;
    height: 45vh;
`;

const MetricsSelectorContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const initialChartItems: VisibleChartItems = {
    light: true, // can tell if in box/cupboard, day and night
    soilMoisture: true, // can tell if not in soil
    rssi: true, // signal level indicator
    battery: true,
    airTemp: true,
};

export const SensorData: React.FC<Props> = ({ serial }) => {
    const { fetchStatus, data } = useSensorDataFetch(serial);
    const [chartItems, setChartItems] = useState<VisibleChartItems>(
        initialChartItems,
    );

    const initialZoom: [Date, Date] = [
        moment()
            .subtract(1, 'week')
            .toDate(),
        new Date(),
    ];

    return (
        <Container>
            <ChartContainer>
                <Chart
                    data={data}
                    items={chartItems}
                    fetching={fetchStatus === 'fetching'}
                    mouseZoom
                    initialZoom={initialZoom}
                />
            </ChartContainer>
            <MetricsSelectorContainer>
                <SensorMetricsSelector
                    value={chartItems}
                    onChange={setChartItems}
                />
            </MetricsSelectorContainer>
        </Container>
    );
};
