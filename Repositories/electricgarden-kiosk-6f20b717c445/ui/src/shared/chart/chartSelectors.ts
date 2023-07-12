import { max, min, uniqBy } from "lodash-es";
import moment from "moment";
import { createSelector, Selector } from "reselect";
import { DomainPropType, DomainTuple } from "victory";

import {
  Metric,
  metricsSelector,
  sensorMetricsByType,
  transformLux,
  transformMoisture,
} from "../metrics";
import { Sample, SampleValues } from "../sample";
import { calculateFilterFactor } from "./calculators";
import { VisibleChartItems } from "./chartConfig";

interface Props {
  data?: Sample[];
  items: VisibleChartItems;
  dateRange?: {
    startDate: moment.Moment;
    endDate: moment.Moment;
  };
}

interface PropsAndSettings {
  props: Props;
}

const propsAndSettingsSelector = (value: PropsAndSettings) => value;

const samplesSelector = createSelector(
  propsAndSettingsSelector,
  ({ props }) => props.data || [],
);

const dateRangeSelector = createSelector(
  propsAndSettingsSelector,
  ({ props }) => props.dateRange,
);

export const activeChartedItemsSelector = createSelector(
  propsAndSettingsSelector,
  metricsSelector,
  ({ props }, metrics) =>
    Object.entries(props.items)
      .filter(([, selected]) => selected)
      .map(([name]) => metrics.find(({ type }) => type === name))
      .filter((value): value is Metric => !!value),
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
  samplesSelector,
  (samples): Sample[] =>
    samples.map(({ light, soilMoisture, ...item }) => ({
      ...item,
      // Needs to be displayed logarithmically
      light: light && transformLux(light),
      soilMoisture: soilMoisture && transformMoisture(soilMoisture),
    })),
);

export const renderDataInDateRangeSelector = createSelector(
  renderDataSelector,
  dateRangeSelector,
  (data, dateRange) =>
    dateRange
      ? data.filter(({ timestamp }) =>
          moment(timestamp).isBetween(dateRange.startDate, dateRange.endDate),
        )
      : data,
);

const DOMAIN_Y_DEFAULT_MIN = 0;
const DOMAIN_Y_DEFAULT_MAX = 30;
const DOMAIN_X_DEFAULT_MIN = moment()
  .startOf("day")
  .subtract(1, "days")
  .toDate();
const DOMAIN_X_DEFAULT_MAX = new Date();

export type RenderDataItem = {
  timestamp: Date;
};

const getTimestampDomainFromData = (data: RenderDataItem[]): [Date, Date] => {
  const timestampSeconds = data.map(({ timestamp }) => timestamp.getTime());
  const minTimestamp = new Date(
    min(timestampSeconds) || DOMAIN_X_DEFAULT_MIN.getTime(),
  );
  const maxTimestamp = new Date(
    max(timestampSeconds) || DOMAIN_X_DEFAULT_MAX.getTime(),
  );

  // if only one data point then bracket an hour either side of it
  if (+minTimestamp === +maxTimestamp) {
    return [
      moment(minTimestamp).subtract(1, "hours").toDate(),
      moment(maxTimestamp).add(1, "hours").toDate(),
    ];
  }
  return [minTimestamp, maxTimestamp];
};

export const activeChartedItemsWithDataSelectorCreate = (
  dataSelector: SamplesSelector,
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
          value: readings[item.reading] ?? null,
        }))
        .filter(({ value }) => value !== null), // removes gaps in line
    })),
  );

type SamplesSelector = Selector<PropsAndSettings, Sample[]>;

export const horizontalDomainSelectorCreate = (samplesSelector: SamplesSelector) =>
  createSelector(
    samplesSelector,
    activeDataPropertyNamesSelector,
    (data): DomainTuple => {
      const [minTimestamp, maxTimestamp] = getTimestampDomainFromData(data);
      return [minTimestamp, maxTimestamp];
    },
  );

export const activeUnitDomainsSelectorCreate = (
  samplesSelector: SamplesSelector,
) =>
  createSelector(samplesSelector, activeUnitsSelector, (data, activeUnits) => {
    const propertyNamesByUnitType = Object.values(sensorMetricsByType).reduce<
      Record<string, string[]>
    >((result, metric) => {
      const unitType = metric.unit.type;
      if (!(unitType in result)) {
        result[unitType] = [];
      }
      result[unitType].push(metric.reading);
      return result;
    }, {});

    const [minTimestamp, maxTimestamp] = getTimestampDomainFromData(data);

    return activeUnits.reduce<Record<string, DomainPropType>>(
      (result, unit) => {
        const propertyNames = propertyNamesByUnitType[unit.type];

        const extractActivePropertyValues = (sample: Sample): number[] =>
          Object.entries(sample)
            .filter((entry): entry is [keyof SampleValues, number | null] =>
              propertyNames.includes(entry[0] as keyof SampleValues),
            )
            .map(([, value]) => value ?? 0);

        const minValues = data
          .map((item) => Math.min(...extractActivePropertyValues(item)))
          .concat(0); // baseline at 0 or below
        const minY = min(minValues) || DOMAIN_Y_DEFAULT_MIN;

        const maxValues = data.map((item) =>
          Math.max(...extractActivePropertyValues(item)),
        );
        const maxY = max(maxValues) || DOMAIN_Y_DEFAULT_MAX;

        result[unit.type] = {
          x: [minTimestamp, maxTimestamp],
          y: [minY, maxY],
        };
        return result;
      },
      {},
    );
  });

export const activeUnitVerticalDomainsSelector = activeUnitDomainsSelectorCreate(
  renderDataInDateRangeSelector,
);

export const horizontalDomainSelector = horizontalDomainSelectorCreate(
  renderDataInDateRangeSelector,
);

export const pointRangeSelector = createSelector(
  renderDataInDateRangeSelector,
  horizontalDomainSelector,
  (data, [from, to]) => {
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
