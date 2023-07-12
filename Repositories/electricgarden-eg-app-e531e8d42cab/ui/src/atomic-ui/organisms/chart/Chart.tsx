import moment from 'moment';
import React, { useCallback, useState, useEffect } from 'react';
import { AutoSizer } from 'react-virtualized';
import {
    DomainPropType,
    VictoryAxis,
    VictoryChart,
    VictoryLine,
    VictoryScatter,
    VictoryTooltip,
    VictoryZoomContainer,
} from 'victory';

import { VisibleChartItems } from './chartConfig';
import { ChartLoadingIndicator } from './ChartLoadingIndicator';
import {
    activeChartedItemsWithDataSelectorCreate,
    activeUnitsSelector,
    domainSelector,
    filteredRenderDataSelector,
    filterFactorSelector,
    zoomDomainSelector,
} from './chartSelectors';
import { FilterFactor } from './FilterFactor';
import { labelFormatterCreate } from './formatters';

export interface ChartProps {
    data: DataPoint[];
    fetching?: boolean;
    items: VisibleChartItems;
    mouseZoom?: boolean;
    dateRange?: {
        startDate: moment.Moment;
        endDate: moment.Moment;
    };
    initialZoom?: [Date, Date];
}

const activeChartedItemsWithFilteredDataSelector = activeChartedItemsWithDataSelectorCreate(
    filteredRenderDataSelector,
);

export const Chart: React.FC<ChartProps> = (props) => {
    const [zoomedXDomain, setZoomedXDomain] = useState<
        [Date, Date] | undefined
    >(props.initialZoom);

    const handleDomainChange = useCallback((domain: DomainPropType) => {
        if ('x' in domain) {
            setZoomedXDomain(domain.x as [Date, Date]);
        }
    }, []);

    const propsAndState = { props, state: { zoomedXDomain } };
    const activeUnits = activeUnitsSelector(propsAndState);
    const domain = domainSelector(propsAndState);
    const zoomDomain = zoomDomainSelector(propsAndState);
    const activeItemsWithData = activeChartedItemsWithFilteredDataSelector(
        propsAndState,
    );
    const filterFactor = filterFactorSelector(propsAndState);

    const rightUnitsCount = activeUnits.filter(
        ({ axis: { orientation } }) => orientation === 'right',
    ).length;

    // reset zoom on data update (e.g. refresh)
    useEffect(() => {
        setZoomedXDomain(props.initialZoom);
    }, [props.data, props.initialZoom]);

    return (
        <>
            <FilterFactor value={filterFactor} />
            <AutoSizer>
                {({ height, width }) => (
                    <div style={{ width, height }}>
                        <VictoryChart
                            scale={{ x: 'time' }}
                            width={Math.max(width, 240)}
                            height={Math.max(height, 240)}
                            domain={domain}
                            padding={{
                                left: 60,
                                right: 60 + (rightUnitsCount - 1) * 80,
                                bottom: 60,
                                top: 60,
                            }}
                            domainPadding={{ y: 10 }}
                            containerComponent={
                                props.mouseZoom ? (
                                    <VictoryZoomContainer
                                        zoomDimension="x"
                                        zoomDomain={zoomDomain}
                                        minimumZoom={{
                                            x: 1000 * 60 * 10,
                                            y: 1,
                                        }}
                                        onZoomDomainChange={handleDomainChange}
                                    />
                                ) : undefined
                            }
                        >
                            {activeItemsWithData.map(
                                ({ reading: name, color, data }) => (
                                    <VictoryLine
                                        key={name}
                                        data={data}
                                        x="timestamp"
                                        y="value"
                                        style={{
                                            data: {
                                                stroke: color,
                                            },
                                        }}
                                    />
                                ),
                            )}
                            {activeItemsWithData.map(
                                ({
                                    label,
                                    unit,
                                    reading: name,
                                    color,
                                    data,
                                }) => (
                                    <VictoryScatter
                                        key={name}
                                        data={data}
                                        labels={labelFormatterCreate({
                                            label,
                                            ...unit,
                                        })}
                                        labelComponent={<VictoryTooltip />}
                                        x="timestamp"
                                        y="value"
                                        size={4}
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
                                ),
                            )}
                            {props.children}
                            <VictoryAxis
                                scale={{ x: 'time' }}
                                style={{
                                    grid: {
                                        stroke: '#6D6E70',
                                        strokeDasharray: '1 10',
                                        strokeLinecap: 'round',
                                        strokeWidth: 1,
                                    },
                                }}
                            />
                            {activeUnits.map(
                                ({
                                    type,
                                    axis: {
                                        label,
                                        offset,
                                        orientation,
                                        tickFormat,
                                    },
                                }) => (
                                    <VictoryAxis
                                        key={type}
                                        dependentAxis
                                        offsetX={offset}
                                        label={label}
                                        orientation={orientation}
                                        tickFormat={tickFormat}
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
                                ),
                            )}
                        </VictoryChart>
                    </div>
                )}
            </AutoSizer>
            {props.fetching && <ChartLoadingIndicator />}
        </>
    );
};
