import { max, min, uniqBy } from 'lodash-es';
import moment from 'moment';
import { createSelector, Selector } from 'reselect';

import { SensorMetric, sensorMetricsSelector } from '../../../metrics';
import { transformLux, transformMoisture } from '../../../utils/dataPoints';
import { calculateFilterFactor } from './calculators';
import { VisibleChartItems } from './chartConfig';

interface RenderDataPoint extends Omit<DataPoint, 'timestamp'> {
    timestamp: Date;
}

interface Props {
    data?: DataPoint[];
    items: VisibleChartItems;
    dateRange?: {
        startDate: moment.Moment;
        endDate: moment.Moment;
    };
}

interface Settings {
    zoomedXDomain?: [Date, Date];
}

interface PropsAndSettings {
    props: Props;
    state: Settings;
}

const propsAndSettingsSelector = (value: PropsAndSettings) => value;

const dataSelector = createSelector(
    propsAndSettingsSelector,
    ({ props }) => props.data || [],
);

const settingsSelector = createSelector(
    propsAndSettingsSelector,
    ({ state }) => state,
);

const dateRangeSelector = createSelector(
    propsAndSettingsSelector,
    ({ props }) => props.dateRange,
);

const zoomedXDomainSelector = createSelector(
    settingsSelector,
    (settings) => settings.zoomedXDomain,
);

export const activeChartedItemsSelector = createSelector(
    propsAndSettingsSelector,
    sensorMetricsSelector,
    ({ props }, metrics) =>
        Object.entries(props.items)
            .filter(([, selected]) => selected)
            .map(([name]) => metrics.find(({ type }) => type === name))
            .filter((value): value is SensorMetric => !!value),
);

export const activeUnitsSelector = createSelector(
    activeChartedItemsSelector,
    (activeChartedItems) =>
        uniqBy(
            activeChartedItems.map((item) => item.unit),
            (m) => m.type,
        ),
);

const activeDataPropertyNamesSelector = createSelector(
    activeChartedItemsSelector,
    (items) => items.map((item) => item.reading),
);

export const renderDataSelector = createSelector(
    dataSelector,
    (data): RenderDataPoint[] =>
        data.map(({ light_sensor, probe_moisture, ...item }) => ({
            ...item,
            // Needs to be displayed logarithmically
            light_sensor: light_sensor && transformLux(light_sensor),
            probe_moisture: probe_moisture && transformMoisture(probe_moisture),
        })),
);

export const renderDataInDateRangeSelector = createSelector(
    renderDataSelector,
    dateRangeSelector,
    (data, dateRange) =>
        dateRange
            ? data.filter(({ timestamp }) =>
                  moment(timestamp).isBetween(
                      dateRange.startDate,
                      dateRange.endDate,
                  ),
              )
            : data,
);

const DOMAIN_Y_DEFAULT_MIN = 0;
const DOMAIN_Y_DEFAULT_MAX = 30;
const DOMAIN_X_DEFAULT_MIN = moment()
    .startOf('day')
    .subtract(1, 'days')
    .toDate();
const DOMAIN_X_DEFAULT_MAX = new Date();

export type RenderDataItem = {
    timestamp: Date;
};

export type Domain = {
    x: [Date, Date];
    y: [number, number];
};

const getTimestampDomainFromData = (data: RenderDataItem[]): [Date, Date] => {
    const timestampMs = data.map(({ timestamp }) => timestamp.getTime());
    const minTimestamp = new Date(
        min(timestampMs) || DOMAIN_X_DEFAULT_MIN.getTime(),
    );
    const maxTimestamp = new Date(
        max(timestampMs) || DOMAIN_X_DEFAULT_MAX.getTime(),
    );

    // if only one data point then bracket an hour either side of it
    if (+minTimestamp === +maxTimestamp) {
        return [
            moment(minTimestamp).subtract(1, 'hours').toDate(),
            moment(maxTimestamp).add(1, 'hours').toDate(),
        ];
    }
    return [minTimestamp, maxTimestamp];
};

export const activeChartedItemsWithDataSelectorCreate = (
    dataSelector: RenderDataSelector,
) =>
    createSelector(activeChartedItemsSelector, dataSelector, (items, data) =>
        items.map((item) => ({
            ...item,
            data: data
                .map(({ timestamp, ...readings }): {
                    timestamp: Date;
                    value: number | null;
                } => ({
                    timestamp,
                    value: readings[item.reading],
                }))
                .filter(({ value }) => value !== null), // removes gaps in line
        })),
    );

type RenderDataSelector = Selector<PropsAndSettings, RenderDataPoint[]>;

// add a clumsy buffer to the Y domain so the top values don't get clipped.
const DOMAIN_Y_BUFFER_PERCENTAGE = 0.02;

export const domainSelectorCreate = (dataSelector: RenderDataSelector) =>
    createSelector(
        dataSelector,
        activeDataPropertyNamesSelector,
        (data, propertyNames): Domain => {
            const [minTimestamp, maxTimestamp] = getTimestampDomainFromData(
                data,
            );

            const extractActivePropertyValues = (
                item: RenderDataPoint,
            ): number[] =>
                Object.entries(item)
                    .filter((entry) => propertyNames.includes(entry[0] as any))
                    .map(([, value]) => value ?? 0);

            const minValues = data
                .map((item) => Math.min(...extractActivePropertyValues(item)))
                .concat(DOMAIN_Y_DEFAULT_MIN); // baseline at 0 or below
            const minY = min(minValues) ?? DOMAIN_Y_DEFAULT_MIN;

            const maxValues = data.map((item) =>
                Math.max(...extractActivePropertyValues(item)),
            );
            const maxY = max(maxValues) ?? DOMAIN_Y_DEFAULT_MAX;

            return {
                x: [minTimestamp, maxTimestamp],
                y: [minY, maxY + Math.round(maxY * DOMAIN_Y_BUFFER_PERCENTAGE)],
            };
        },
    );

export const domainSelector = domainSelectorCreate(
    renderDataInDateRangeSelector,
);

export const pointRangeSelector = createSelector(
    renderDataInDateRangeSelector,
    zoomedXDomainSelector,
    domainSelector,
    (data, zoomedXDomain, domain) => {
        const [from, to] = zoomedXDomain || domain.x;

        // NOTE: this is making assumption that data is in ascending order of timestamp
        const firstIndex = data.findIndex((d) => +d.timestamp >= +from);
        let lastIndex = data.findIndex((d) => +d.timestamp > +to);
        lastIndex = lastIndex === -1 ? data.length : lastIndex;

        return {
            first: Math.max(firstIndex - 1, 0),
            last: Math.min(lastIndex + 1, data.length),
        };
    },
);

export const filterFactorSelector = createSelector(
    pointRangeSelector,
    calculateFilterFactor,
);

export const filteredRenderDataSelector = createSelector(
    renderDataInDateRangeSelector,
    pointRangeSelector,
    (data, range) => {
        const k = calculateFilterFactor(range);

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

export const zoomDomainSelector = createSelector(
    domainSelectorCreate(filteredRenderDataSelector),
    zoomedXDomainSelector,
    (domain, zoomedXDomain): Domain =>
        zoomedXDomain ? { x: zoomedXDomain, y: domain.y } : domain,
);
