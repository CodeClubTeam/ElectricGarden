import fileSaver from 'file-saver';
import moment from 'moment';
import Papa from 'papaparse';
import React from 'react';
import { Dropdown, SplitButton } from 'react-bootstrap';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import styled from 'styled-components/macro';

import { Button, SensorMetricsSelector } from '../../../atomic-ui';
import { Chart } from '../../../atomic-ui/organisms';
import { PageHeader } from '../../../components/common';
import {
    createAppStructuredSelector,
    currentOrganisationIdSelector,
} from '../../../selectors';
import { dateRangeEquals } from '../../../utils';
import { ChartView, fetchData, updateChartView } from '../actions';
import {
    chartViewSelector,
    dataFetchStateSelectorCreate,
    dataSelectorCreate,
    selectedSensorSerialSelector,
} from '../selectors';
import { DateSelection } from './DateSelection';
import { SensorSelector } from './SensorSelector';

const AUTO_POLL_INTERVAL = 10 * 1000;

const ContentContainer = styled.div`
    display: flex;
    align-items: flex-start;
`;

const SideMenuContainer = styled.div`
    display: grid;
`;

const NotesContainer = styled.div`
    padding: 10px 10px 0px 10px;
    font-size: 18px;
    font-weight: bold;
`;

const NotesContentContainer = styled.div`
    background-color: #d4edd1;
    width: 300px;
    margin: 0 40px 10px 40px;
    padding: 1px 0;
    border-radius: 10px;
    grid-column: 1;
    grid-row: 3;
`;

const ChartContainer = styled.div`
    border: 2px solid #a7a9ab;
    border-radius: 8px;
    flex: 1;
    height: 70vh;
`;

const MetricsSelectorContainer = styled.div`
    background-color: #d4edd1;
    width: 300px;
    border-radius: 10px;
    margin: 0 40px 10px 40px;
    padding: 0.5em 0;
    grid-column: 1;
    grid-row: 2;
`;

const PageHeaderContentContainer = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
`;

class Dashboard extends React.PureComponent<Props, State> {
    private pollIntervalKey: any;
    private unmounted = false;

    private onSensorChange = (currentSensor?: Sensor) => {
        this.setChartView({ ...this.props.chartView, currentSensor });
    };

    componentDidUpdate(prevProps: Props) {
        const {
            sensorSerial,
            fetchState: { fetching, fetched },
        } = this.props;
        if (sensorSerial && !(fetching || fetched)) {
            this.refreshData();
        }
        const prevDateRange = prevProps.chartView.dataChartDates;
        const dateRange = this.props.chartView.dataChartDates;
        if (!dateRangeEquals(prevDateRange, dateRange, 'hour')) {
            this.refreshData();
        }
        this.updatePollState();
    }

    componentDidMount() {
        this.updatePollState();
    }

    componentWillUnmount() {
        this.unmounted = true;
        clearInterval(this.pollIntervalKey);
    }

    private setChartView = (chartView: ChartView) => {
        this.props.updateChartView(chartView);
    };

    private refreshData = () => {
        if (this.unmounted) {
            return;
        }
        const {
            sensorSerial,
            chartView,
            fetchState,
            organisationId: orgId,
        } = this.props;
        const { fetching } = fetchState;
        if (sensorSerial && !fetching) {
            const { startDate, endDate } = chartView.dataChartDates;
            const dateRange: DateRange = {
                startDate: startDate
                    ? startDate.clone().subtract(12, 'hours')
                    : moment().subtract(1, 'days'),
                endDate: endDate ? endDate.clone().add(12, 'hours') : moment(),
            };
            this.props.fetchData({ sensorSerial, dateRange, orgId });
        }
    };

    private updatePollState = () => {
        if (this.props.chartView.autoPoll && !this.pollIntervalKey) {
            this.pollIntervalKey = setInterval(
                this.refreshData,
                AUTO_POLL_INTERVAL,
            );
        } else if (!this.props.chartView.autoPoll && this.pollIntervalKey) {
            clearInterval(this.pollIntervalKey);
        }
    };

    private exportData = () => {
        const {
            sensorSerial,
            data,
            fetchState: { fetched },
        } = this.props;
        if (!fetched) {
            return;
        }
        const csvData = data.map((point) => {
            return {
                timestamp: moment(point.timestamp).format(
                    'yyyy-MM-DD HH:mm:ss',
                ),
                humidity: point.ambient_humidity,
                light_sensor: point.light_sensor,
                air_temp: point.probe_air_temp,
                soil_moisture: point.probe_moisture,
                soil_temp: point.probe_soil_temp,
                battery_voltage: point.battery_voltage,
                co2: point.co2,
                /**rssi: point.rssi,
                snr: point.snr,**/
            };
        });

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });
        fileSaver.saveAs(blob, `${sensorSerial}.csv`);
    };

    render() {
        const {
            sensorSerial,
            fetchState: { fetching },
        } = this.props;

        const data = sensorSerial && fetching ? [] : this.props.data;

        return (
            <div>
                <PageHeader>
                    <PageHeaderContentContainer>
                        <h2>My Data</h2>
                        <div className="filler"></div>
                        <SplitButton
                            disabled={fetching}
                            onClick={this.refreshData}
                            variant="secondary"
                            title={fetching ? 'loading...' : 'refresh'}
                            id="refresh-data"
                        >
                            <Dropdown.Item
                                eventKey="1"
                                onClick={() =>
                                    this.setChartView({
                                        ...this.props.chartView,
                                        autoPoll:
                                            !this.props.chartView.autoPoll,
                                    })
                                }
                            >
                                Auto poll {this.props.chartView.autoPoll && '✓'}
                            </Dropdown.Item>
                        </SplitButton>
                        <SensorSelector
                            onChange={this.onSensorChange}
                            value={this.props.chartView.currentSensor}
                            autoSelectFirstOnLoad
                        />
                        <MediaQuery minDeviceWidth={1025}>
                            <Button
                                onClick={this.exportData}
                                style={{ width: '300px', marginRight: '40px' }}
                            >
                                export data
                            </Button>
                        </MediaQuery>
                    </PageHeaderContentContainer>
                    <ContentContainer>
                        <ChartContainer>
                            <Chart
                                key={sensorSerial}
                                data={data}
                                fetching={fetching}
                                items={this.props.chartView.visibleChartItems}
                                mouseZoom={true}
                            />
                        </ChartContainer>
                        <SideMenuContainer>
                            <MediaQuery minDeviceWidth={1025}>
                                <MetricsSelectorContainer>
                                    <SensorMetricsSelector
                                        value={
                                            this.props.chartView
                                                .visibleChartItems
                                        }
                                        onChange={(visibleChartItems) =>
                                            this.setChartView({
                                                ...this.props.chartView,
                                                visibleChartItems,
                                            })
                                        }
                                        filter={(metric) => !metric.admin}
                                    />
                                </MetricsSelectorContainer>
                                <DateSelection
                                    value={this.props.chartView.dataChartDates}
                                    onChange={(dataChartDates) =>
                                        this.setChartView({
                                            ...this.props.chartView,
                                            dataChartDates,
                                        })
                                    }
                                />
                                <NotesContainer>
                                    <NotesContentContainer>
                                        <p>
                                            NOTE: Scroll over the graph to zoom
                                            in or out.
                                        </p>
                                    </NotesContentContainer>
                                </NotesContainer>
                            </MediaQuery>
                        </SideMenuContainer>
                    </ContentContainer>
                    <MediaQuery maxDeviceWidth={1024}>
                        <MetricsSelectorContainer>
                            <SensorMetricsSelector
                                value={this.props.chartView.visibleChartItems}
                                onChange={(visibleChartItems) =>
                                    this.setChartView({
                                        ...this.props.chartView,
                                        visibleChartItems,
                                    })
                                }
                                filter={(metric) => !metric.admin}
                            />
                        </MetricsSelectorContainer>
                    </MediaQuery>
                </PageHeader>
            </div>
        );
    }
}

interface State {}

const connector = connect(
    createAppStructuredSelector({
        data: dataSelectorCreate(selectedSensorSerialSelector),
        chartView: chartViewSelector,
        sensorSerial: selectedSensorSerialSelector,
        fetchState: dataFetchStateSelectorCreate(selectedSensorSerialSelector),
        organisationId: currentOrganisationIdSelector,
    }),
    {
        fetchData,
        updateChartView,
    },
);

type Props = ExtractProps<typeof connector>;

export default connector(Dashboard);
