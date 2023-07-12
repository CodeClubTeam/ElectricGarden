import moment from 'moment';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components/macro';

import { Chart, Loading, VisibleChartItems } from '../../../../atomic-ui';
import { KioskControlPanel } from './KioskControlPanel';
import { PushTheRedButtonPrompt } from './PushTheRedButtonPrompt';
import { useFetchLiveSensorData } from './useFetchLiveSensorData';
import { last } from 'lodash-es';

const Container = styled.div`
    margin-top: 1em;
    display: flex;
    align-items: flex-start;
`;

const ChartContainer = styled.div`
    border: 2px solid #a7a9ab;
    border-radius: 8px;
    flex: 1;
    height: 70vh;
    margin-left: 10px;
    margin-bottom: 10px;

    @media (max-width: 1024px) {
        max-width: 700px;
    }
`;

const ControlPanelContainer = styled.div`
    display: grid;
`;

const NoDataContainer = styled.div`
    margin: auto;
`;

type Props = {
    serial: string;
};

const LIVE_MODE_DURATION_MS =
    (Number(process.env.REACT_APP_LIVE_MODE_DURATION_MINUTES) ?? 2) * 60 * 1000;

export const KioskData = ({ serial }: Props) => {
    const [chartItems, setChartItems] = useState<VisibleChartItems>({
        airTemp: true,
        soilTemp: true,
        soilMoisture: true,
        humidity: true,
    });
    const { isFetching, isSuccess, data } = useFetchLiveSensorData(serial);
    const [points, setPoints] = useState<DataPoint[]>([]);
    const [firstDataPoint, setFirstDataPoint] = useState<DataPoint>();
    const [lastDataPoint, setLastDataPoint] = useState<DataPoint>();

    // need the state to prevent blinking of numbers as react-query clears 'data' when refetching
    // quite awkward
    useEffect(() => {
        if (!isFetching && data && data.points.length > 0) {
            setPoints(data.points);
            setFirstDataPoint(data.points[0]);
            setLastDataPoint(last(data.points));
        }
    }, [data, isFetching]);

    if (isSuccess && data?.points.length === 0) {
        return (
            <Container>
                <NoDataContainer>
                    <PushTheRedButtonPrompt
                        loading={
                            isFetching && (
                                <Loading message="Polling sensor data" />
                            )
                        }
                    />
                </NoDataContainer>
            </Container>
        );
    }

    if (lastDataPoint) {
        // add fake point 5 minutes into future so axis is far to right and fills in from the left
        const fakeLastPoint: DataPoint = {
            timestamp: moment(firstDataPoint?.timestamp)
                .add(LIVE_MODE_DURATION_MS, 'milliseconds')
                .toDate(),
            ambient_humidity: null,
            batteryPercent: null,
            battery_voltage: null,
            light_sensor: null,
            probe_air_temp: null,
            probe_moisture: null,
            probe_soil_temp: null,
            rssi: null,
            snr: null,
            co2: null,
        };
        points.push(fakeLastPoint);
    }
    return (
        <Container>
            <ChartContainer>
                <Chart
                    key={serial}
                    data={points}
                    fetching={false}
                    items={chartItems}
                    mouseZoom={true}
                />
            </ChartContainer>
            <ControlPanelContainer>
                <KioskControlPanel
                    serial={serial}
                    chartItems={chartItems}
                    onChartItemsChanged={(newItems) => setChartItems(newItems)}
                    latestDataPoint={lastDataPoint}
                />
            </ControlPanelContainer>
        </Container>
    );
};
