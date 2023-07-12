import fileSaver from 'file-saver';
import moment from 'moment';
import Papa from 'papaparse';
import React from 'react';
import { MenuItem, SplitButton } from 'react-bootstrap';
import Button from 'react-bootstrap/lib/Button';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import Select from 'react-select';
import { ValueType } from 'react-select/lib/types';

import { PageHeader } from '../../../components/common';
import { createAppStructuredSelector } from '../../../selectors';
import { getArray } from '../../../utils';
import {
    sensorOptionsSelector,
    sensorsFetchingSelector,
    sensorsSelector,
} from '../../Hardware';
import { ChartView, fetchData, updateChartView } from '../actions';
import {
    chartViewSelector,
    dataFetchingSelector,
    dataSelector,
} from '../selectors';
import { Chart } from './Chart';
import { CheckboxSection } from './CheckboxSection';
import { DateSelection } from './DateSelection';

const AUTO_POLL_INTERVAL = 10 * 1000;

class Dashboard extends React.PureComponent<Props, State> {
    private pollIntervalKey: any;

    private onSensorChange = (newTags: ValueType<Tag>) => {
        const currentSensor = getArray(newTags)[0];

        this.setChartView({ ...this.props.chartView, currentSensor });
    };

    componentDidUpdate(prevProps: Props, prevState: State) {
        let sensorSerial =
            this.props.chartView.currentSensor &&
            this.props.chartView.currentSensor.value;
        let data = sensorSerial && this.props.data[sensorSerial];
        if (!data && sensorSerial && !this.props.fetchingData) {
            this.refreshData();
        }

        if (
            prevProps.chartView.dataChartDates.startDate !==
                this.props.chartView.dataChartDates.startDate ||
            prevProps.chartView.dataChartDates.endDate !==
                this.props.chartView.dataChartDates.endDate
        ) {
            this.refreshData();
        }

        this.updatePollState();

        this.checkDefaultSensor();
    }

    private checkDefaultSensor() {
        if (!this.props.chartView.currentSensor) {
            if (this.props.sensorOptions[0]) {
                this.setChartView({
                    ...this.props.chartView,
                    currentSensor: this.props.sensorOptions[0],
                });
            }
        }
    }

    componentDidMount() {
        this.updatePollState();
        this.checkDefaultSensor();
    }

    componentWillUnmount() {
        clearInterval(this.pollIntervalKey);
    }

    private setChartView = (chartView: ChartView) => {
        this.props.updateChartView(chartView);
    };

    private refreshData = () => {
        let sensorSerial =
            this.props.chartView.currentSensor &&
            this.props.chartView.currentSensor.value;
        let dateRange = null;
        if (
            this.props.chartView.dataChartDates.startDate &&
            this.props.chartView.dataChartDates.endDate
        ) {
            const startDate = this.props.chartView.dataChartDates.startDate.clone();
            const endDate = this.props.chartView.dataChartDates.endDate.clone();
            dateRange = {
                dateRange: {
                    startDate: startDate.subtract(12, 'hours').unix(),
                    endDate: endDate.add(12, 'hours').unix(),
                },
            };
        }
        if (sensorSerial && !this.props.fetchingData) {
            this.props.fetchData({ sensorSerial, dateRange });
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
        let sensorSerial =
            this.props.chartView.currentSensor &&
            this.props.chartView.currentSensor.value;
        let data = sensorSerial ? this.props.data[sensorSerial] : undefined;
        if (!data) {
            return;
        }
        const csvData = data.map((point) => {
            return {
                date: moment(point.timestamp).format('D MMM YYYY'),
                time: moment(point.timestamp).format('HH:mm:ss'),
                ambient_humidity: point.ambient_humidity,
                light_sensor: point.light_sensor,
                probe_air_temp: point.probe_air_temp,
                probe_moisture: point.probe_moisture,
                probe_soil_temp: point.probe_soil_temp,
                battery_voltage: point.battery_voltage,
            };
        });

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });
        fileSaver.saveAs(blob, `${sensorSerial}.csv`);
    };

    render() {
        const { fetchingData } = this.props;
        const sensorSerial =
            this.props.chartView.currentSensor &&
            this.props.chartView.currentSensor.value;
        const data =
            sensorSerial && !fetchingData
                ? this.props.data[sensorSerial]
                : undefined;

        return (
            <div>
                <PageHeader>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        <h2>My Data</h2>
                        <div className="filler"></div>
                        <SplitButton
                            disabled={fetchingData}
                            onClick={this.refreshData}
                            style={{ width: '150px' }}
                            title={fetchingData ? 'loading...' : 'refresh'}
                            id="refresh-data"
                        >
                            <MenuItem
                                eventKey="1"
                                onClick={() =>
                                    this.setChartView({
                                        ...this.props.chartView,
                                        autoPoll: !this.props.chartView
                                            .autoPoll,
                                    })
                                }
                            >
                                Auto poll {this.props.chartView.autoPoll && '✓'}
                            </MenuItem>
                        </SplitButton>
                        <div style={{ width: '300px', margin: '0 40px' }}>
                            <Select
                                options={this.props.sensorOptions}
                                value={this.props.chartView.currentSensor}
                                onChange={this.onSensorChange}
                                isLoading={this.props.fetchingSensors}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: 'white',
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        margin: '1px 0',
                                    }),
                                }}
                                components={{
                                    IndicatorSeparator: () => null,
                                }}
                            />
                        </div>
                        <MediaQuery minDeviceWidth={1025}>
                            <Button
                                onClick={this.exportData}
                                bsStyle="primary"
                                style={{ width: '300px', marginRight: '40px' }}
                            >
                                export data
                            </Button>
                        </MediaQuery>
                    </div>
                    <div className="dashboard-body">
                        <Chart
                            key={sensorSerial}
                            data={data}
                            state={this.props.chartView.visibleChartItems}
                        />
                        <div className="side-menu">
                            <MediaQuery minDeviceWidth={1025}>
                                <CheckboxSection
                                    state={
                                        this.props.chartView.visibleChartItems
                                    }
                                    onChange={(visibleChartItems) =>
                                        this.setChartView({
                                            ...this.props.chartView,
                                            visibleChartItems,
                                        })
                                    }
                                />
                                <DateSelection
                                    state={this.props.chartView.dataChartDates}
                                    onChange={(dataChartDates) =>
                                        this.setChartView({
                                            ...this.props.chartView,
                                            dataChartDates,
                                        })
                                    }
                                />
                                <div className="notes-container">
                                    <div className="notes-text">
                                        <p>
                                            NOTE: Scroll over the graph to zoom
                                            in or out.
                                        </p>
                                    </div>
                                </div>
                            </MediaQuery>
                        </div>
                    </div>
                    <MediaQuery maxDeviceWidth={1024}>
                        <CheckboxSection
                            state={this.props.chartView.visibleChartItems}
                            onChange={(visibleChartItems) =>
                                this.setChartView({
                                    ...this.props.chartView,
                                    visibleChartItems,
                                })
                            }
                        />
                    </MediaQuery>
                </PageHeader>
            </div>
        );
    }
}

interface State {}

const connector = connect(
    createAppStructuredSelector({
        sensorOptions: sensorOptionsSelector,
        sensors: sensorsSelector,
        data: dataSelector,
        chartView: chartViewSelector,
        fetchingData: dataFetchingSelector,
        fetchingSensors: sensorsFetchingSelector,
    }),
    {
        fetchData,
        updateChartView,
    },
);

type Props = ExtractProps<typeof connector>;

export default connector(Dashboard);
