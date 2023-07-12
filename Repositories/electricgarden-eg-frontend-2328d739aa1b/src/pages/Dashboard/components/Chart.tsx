import moment from 'moment';
import React from 'react';
import { AutoSizer } from 'react-virtualized';
import { createSelector } from 'reselect';
import {
    DomainPropType,
    VictoryAxis,
    VictoryChart,
    VictoryLine,
    VictoryScatter,
    VictoryTooltip,
    VictoryZoomContainer,
} from 'victory';

import { VisibleChartItems } from '../actions';

// import VictoryChart from 'victory-chart';
// import VictoryZoomContainer from 'victory-zoom-container';
// import VictoryAxis from 'victory-axis';
// import VictoryScatter from 'victory-scatter';
// import VictoryLine from 'victory-line';

interface Props {
    data?: DataPoint[];
    state: VisibleChartItems;
}

export class Chart extends React.PureComponent<Props, State> {
    state: State = {};

    private getData = createSelector(
        (propsAndState: PropsAndState) => propsAndState.props.data,
        (data = []) => {
            return data.map((item) => ({
                ...item,
                // Needs to be displayed logarithmically
                light_sensor: transformLux(item.light_sensor),
                probe_moisture: transformMoisture(item.probe_moisture),
            }));
        },
    );

    private getDomain = createSelector(
        this.getData,
        (data) => {
            let domain = {
                x: [
                    moment()
                        .startOf('day')
                        .subtract(1, 'days')
                        .valueOf(),
                    Date.now(),
                ] as [number, number],
                y: [0, 30] as [number, number],
            };

            for (let item of data) {
                domain.x[0] = Math.min(domain.x[0], item.timestamp);
                domain.x[1] = Math.max(domain.x[0], item.timestamp);

                domain.y[0] = Math.min(
                    domain.y[0],
                    item.ambient_humidity || 0,
                    item.light_sensor || 0,
                    item.probe_air_temp || 0,
                    item.probe_moisture || 0,
                    item.probe_soil_temp || 0,
                );

                domain.y[1] = Math.max(
                    domain.y[1],
                    item.ambient_humidity || 0,
                    item.light_sensor || 0,
                    item.probe_air_temp || 0,
                    item.probe_moisture || 0,
                    item.probe_soil_temp || 0,
                );
            }
            return domain;
        },
    );

    private getPointRange = createSelector(
        this.getData,
        (propsAndState: PropsAndState) => propsAndState.state.zoomedXDomain,
        this.getDomain,
        (data = [], zoomedXDomain, domain) => {
            let range = zoomedXDomain || domain.x;

            let first = data.findIndex((d) => d.timestamp >= range[0]);
            let last = data.findIndex((d) => d.timestamp > range[1]);
            last = last === -1 ? data.length - 1 : last;

            return {
                first: Math.max(first - 1, 0),
                last: Math.min(last + 1, data.length - 1),
            };
        },
    );

    private getFilterFactor = (range: { first: number; last: number }) => {
        let maxPoints = 100;

        let filteredLength = range.last - range.first;

        // limit k to powers of 2, e.g. 64, 128, 256
        // so that the same points will be chosen reliably, reducing flicker
        let k = Math.pow(2, Math.ceil(Math.log2(filteredLength / maxPoints)));
        k = isNaN(k) ? 1 : k;
        return Math.max(1, k);
    };

    private getFilteredData = createSelector(
        this.getData,
        this.getPointRange,
        (data = [], range) => {
            let k = this.getFilterFactor(range);

            if (k > 1) {
                // Ensure point a point from outside the view gets included
                range = {
                    first: Math.floor(range.first / k) * k,
                    last: Math.ceil(range.last / k + 1) * k,
                };
                return data.slice(range.first, range.last).filter(
                    // ensure modulo is always calculated from same reference: i + startIndex
                    (d, i) => (i + range.first) % k === 0,
                );
            }

            return data.slice(range.first, range.last);
        },
    );

    private onDomainChange = (domain: DomainPropType) => {
        if ('x' in domain && domain.x) {
            this.setState({
                zoomedXDomain: domain.x as [number, number],
            });
        }
    };

    render() {
        let propsAndState = { props: this.props, state: this.state };
        let domain = this.getDomain(propsAndState);
        let data = this.getFilteredData(propsAndState);
        let filterFactor = this.getFilterFactor(
            this.getPointRange(propsAndState),
        );

        return (
            <div className="graph">
                <div
                    style={{
                        position: 'absolute',
                        bottom: '5px',
                        right: '10px',
                    }}
                >
                    {filterFactor === 1
                        ? 'Viewing all readings'
                        : `Viewing 1 in every ${filterFactor} readings`}
                </div>
                <AutoSizer>
                    {({ height, width }) => (
                        <div style={{ width, height }}>
                            <VictoryChart
                                // scale={{ x: 'time' }}
                                width={Math.max(width, 240)}
                                height={Math.max(height, 240)}
                                domain={domain}
                                padding={{
                                    left: 60,
                                    right: 140,
                                    bottom: 60,
                                    top: 60,
                                }}
                                domainPadding={{ y: 10 }}
                                containerComponent={
                                    <VictoryZoomContainer
                                        zoomDimension="x"
                                        minimumZoom={{
                                            x: 1000 * 60 * 10,
                                            y: 1,
                                        }}
                                        onZoomDomainChange={this.onDomainChange}
                                    />
                                }
                            >
                                {this.props.state.soilTemp && (
                                    <VictoryLine
                                        data={data}
                                        x="timestamp"
                                        y="probe_soil_temp"
                                        style={{
                                            data: {
                                                stroke: '#53B847',
                                            },
                                        }}
                                    />
                                )}
                                {this.props.state.soilTemp && (
                                    <VictoryScatter
                                        data={data}
                                        x="timestamp"
                                        y="probe_soil_temp"
                                        labels={(e) =>
                                            formatLabel(
                                                'Soil Temperature',
                                                e._x,
                                                e._y,
                                                '°C',
                                            )
                                        }
                                        labelComponent={<VictoryTooltip />}
                                        size={4}
                                        style={{
                                            data: {
                                                fill: 'white',
                                                stroke: '#53B847',
                                                strokeWidth: 2,
                                            },
                                            labels: {
                                                fontSize: '24px',
                                                fill: '#53B847',
                                            },
                                        }}
                                    />
                                )}

                                {this.props.state.airTemp && (
                                    <VictoryLine
                                        data={data}
                                        x="timestamp"
                                        y="probe_air_temp"
                                        style={{
                                            data: {
                                                stroke: '#27A9E1',
                                            },
                                        }}
                                    />
                                )}
                                {this.props.state.airTemp && (
                                    <VictoryScatter
                                        data={data}
                                        labels={(e) =>
                                            formatLabel(
                                                'Air Temperature',
                                                e._x,
                                                e._y,
                                                '°C',
                                            )
                                        }
                                        labelComponent={<VictoryTooltip />}
                                        x="timestamp"
                                        y="probe_air_temp"
                                        size={4}
                                        style={{
                                            data: {
                                                fill: 'white',
                                                stroke: '#27A9E1',
                                                strokeWidth: 2,
                                            },
                                            labels: {
                                                fontSize: '24px',
                                                fill: '#27A9E1',
                                            },
                                        }}
                                    />
                                )}

                                {this.props.state.soilMoisture && (
                                    <VictoryLine
                                        data={data}
                                        x="timestamp"
                                        y="probe_moisture"
                                        style={{
                                            data: {
                                                stroke: 'red',
                                            },
                                        }}
                                    />
                                )}
                                {this.props.state.soilMoisture && (
                                    <VictoryScatter
                                        data={data}
                                        labels={(e) =>
                                            formatLabel(
                                                'Soil Moisture',
                                                e._x,
                                                e._y,
                                                '%',
                                            )
                                        }
                                        labelComponent={<VictoryTooltip />}
                                        x="timestamp"
                                        y="probe_moisture"
                                        size={4}
                                        style={{
                                            data: {
                                                fill: 'white',
                                                stroke: 'red',
                                                strokeWidth: 2,
                                            },
                                            labels: {
                                                fontSize: '24px',
                                                fill: 'red',
                                            },
                                        }}
                                    />
                                )}

                                {this.props.state.humidity && (
                                    <VictoryLine
                                        data={data}
                                        x="timestamp"
                                        y="ambient_humidity"
                                        style={{
                                            data: {
                                                stroke: '#EC008B',
                                            },
                                        }}
                                    />
                                )}
                                {this.props.state.humidity && (
                                    <VictoryScatter
                                        labels={(e) =>
                                            formatLabel(
                                                'Humidity',
                                                e._x,
                                                e._y,
                                                '%',
                                            )
                                        }
                                        labelComponent={<VictoryTooltip />}
                                        data={data}
                                        x="timestamp"
                                        y="ambient_humidity"
                                        size={4}
                                        style={{
                                            data: {
                                                fill: 'white',
                                                stroke: '#EC008B',
                                                strokeWidth: 2,
                                            },
                                            labels: {
                                                fontSize: '24px',
                                                fill: '#EC008B',
                                            },
                                        }}
                                    />
                                )}

                                {this.props.state.light && (
                                    <VictoryLine
                                        data={data}
                                        x="timestamp"
                                        y="light_sensor"
                                        style={{
                                            data: {
                                                stroke: '#3c59ff',
                                            },
                                        }}
                                    />
                                )}
                                {this.props.state.light && (
                                    <VictoryScatter
                                        labels={(e) =>
                                            formatLabel(
                                                'Light',
                                                e._x,
                                                restoreLux(e._y),
                                                'Lux',
                                            )
                                        }
                                        labelComponent={<VictoryTooltip />}
                                        data={data}
                                        x="timestamp"
                                        y="light_sensor"
                                        size={4}
                                        style={{
                                            data: {
                                                fill: 'white',
                                                stroke: '#3c59ff',
                                                strokeWidth: 2,
                                            },
                                            labels: {
                                                fontSize: '24px',
                                                fill: '#3c59ff',
                                            },
                                        }}
                                    />
                                )}

                                {/* {this.props.state.goldilocks && <VictoryArea data={[
                                { x: min, y: 20, y0: 15 },
                                { x: Date.now(), y: 20, y0: 15 },
                            ]} style={{
                                data: {
                                    fill: 'gold',
                                    opacity: 0.3,
                                }
                            }} />} */}

                                <VictoryAxis
                                    scale="time"
                                    style={{
                                        grid: {
                                            stroke: '#6D6E70',
                                            strokeDasharray: '1 10',
                                            strokeLinecap: 'round',
                                            strokeWidth: 1,
                                        },
                                    }}
                                />

                                {(this.props.state.airTemp ||
                                    this.props.state.soilTemp) && (
                                    <VictoryAxis
                                        dependentAxis
                                        offsetX={60}
                                        label="Degrees Celsius (°C)"
                                        // scale='linear'
                                        style={{
                                            axisLabel: {
                                                padding: 30,
                                                fontSize: 18,
                                            },
                                            grid: {
                                                stroke: '#6D6E70',
                                                strokeDasharray: '1 10',
                                                strokeLinecap: 'round',
                                                strokeWidth: 1,
                                            },
                                        }}
                                    />
                                )}
                                {(this.props.state.soilMoisture ||
                                    this.props.state.humidity) && (
                                    <VictoryAxis
                                        dependentAxis
                                        offsetX={140}
                                        label="%"
                                        orientation="right"
                                        // scale='linear'

                                        // domain={{ y: [1, 50] }}
                                        style={{
                                            axisLabel: {
                                                padding: 30,
                                                fontSize: 18,
                                            },
                                            grid: {
                                                stroke: '#6D6E70',
                                                strokeDasharray: '1 10',
                                                strokeLinecap: 'round',
                                                strokeWidth: 1,
                                            },
                                        }}
                                    />
                                )}
                                {this.props.state.light && (
                                    <VictoryAxis
                                        dependentAxis
                                        offsetX={80}
                                        label="Lux"
                                        orientation="right"
                                        tickFormat={(e) =>
                                            `${(
                                                restoreLux(e) || 1
                                            ).toExponential(0)}`
                                        }
                                        style={{
                                            axisLabel: {
                                                padding: 50,
                                                fontSize: 18,
                                            },
                                            grid: {
                                                stroke: '#6D6E70',
                                                strokeDasharray: '1 10',
                                                strokeLinecap: 'round',
                                                strokeWidth: 1,
                                            },
                                        }}
                                    />
                                )}
                            </VictoryChart>
                        </div>
                    )}
                </AutoSizer>
                {!this.props.data && (
                    <div
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '36px',
                                display: 'inline',
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '20px',
                                boxShadow: '0 0 20px -1px black',
                            }}
                        >
                            {' '}
                            LOADING...
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

interface State {
    zoomedXDomain?: [number, number];
}

interface PropsAndState {
    props: Props;
    state: State;
}

function formatLabel(
    dataName: string,
    x: number,
    y: number | null | undefined,
    suffix: string,
) {
    return y != null
        ? `${dataName}\n${y.toFixed(1)}${suffix}\n${moment(x).format(
              'ddd hh:mm:ss A',
          )}`
        : '';
}

// To fit this logarithmic value in a comparable way with the other values
const LUX_MAGIC_CONSTANT = 10;
function transformLux(lux: number | null) {
    if (lux === null) {
        return null;
    }
    return Math.log10(lux) * LUX_MAGIC_CONSTANT;
}

function restoreLux(lux: number | null) {
    if (lux === null) {
        return null;
    }
    return Math.pow(10, lux / LUX_MAGIC_CONSTANT);
}

const MOISTURE_MAGIC_CONSTANT = 1;
function transformMoisture(soilMoisture: number | null) {
    if (soilMoisture === null) {
        return null;
    }
    return soilMoisture * MOISTURE_MAGIC_CONSTANT;
}
