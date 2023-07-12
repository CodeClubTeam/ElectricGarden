import moment from "moment";
import React from "react";
import {
  DomainPaddingPropType,
  VictoryAxis,
  VictoryContainer,
  VictoryLine,
  VictoryScatter,
  VictoryTooltip,
} from "victory";

import { Sample } from "../sample";
import { VisibleChartItems } from "./chartConfig";
import { ChartLoadingIndicator } from "./ChartLoadingIndicator";
import {
  activeChartedItemsWithDataSelectorCreate,
  activeUnitsSelector,
  activeUnitVerticalDomainsSelector,
  filteredRenderDataSelector,
  filterFactorSelector,
  horizontalDomainSelector,
} from "./chartSelectors";
import { FilterFactor } from "./FilterFactor";
import { labelFormatterCreate } from "./formatters";

export interface ChartProps {
  data: Sample[];
  fetching?: boolean;
  items: VisibleChartItems;
  dateRange?: {
    startDate: moment.Moment;
    endDate: moment.Moment;
  };
}

const activeChartedItemsWithFilteredDataSelector = activeChartedItemsWithDataSelectorCreate(
  filteredRenderDataSelector,
);

const gridlineStyle = {
  stroke: "#6D6E70",
  strokeDasharray: "1 10",
  strokeLinecap: "round",
  strokeWidth: 1,
};

const PAD_UNIT = 50;

export const Chart: React.FC<ChartProps> = (props) => {
  const propsAndState = { props };
  const activeUnits = activeUnitsSelector(propsAndState);
  const xDomain = horizontalDomainSelector(propsAndState);
  const yDomainsByUnitType = activeUnitVerticalDomainsSelector(propsAndState);
  const activeItemsWithData = activeChartedItemsWithFilteredDataSelector(
    propsAndState,
  );
  const filterFactor = filterFactorSelector(propsAndState);

  const extraActiveUnitCount = Math.max(activeUnits.length - 2, 0);

  const domainPadding: DomainPaddingPropType = {
    x: [
      0,
      extraActiveUnitCount > 0 ? extraActiveUnitCount * (PAD_UNIT + 2) : 0,
    ],
  };

  const extraAxisPadding =
    extraActiveUnitCount > 0 ? extraActiveUnitCount * PAD_UNIT : 0;

  return (
    <>
      <FilterFactor value={filterFactor} />
      <VictoryContainer width={450} height={280}>
        <g>
          <VictoryAxis
            scale={{ x: "time" }}
            standalone={false}
            domain={xDomain}
            padding={{
              left: PAD_UNIT,
              right: PAD_UNIT + extraAxisPadding,
              bottom: PAD_UNIT,
              top: PAD_UNIT,
            }}
            style={{
              tickLabels: {
                fontSize: `${14 - (extraActiveUnitCount * 2)}px`,
              },
              grid: gridlineStyle,
            }}
          />

          {activeUnits.map(({ type, axis: { label, tickFormat } }, index) => (
            <VictoryAxis
              key={type}
              name={type}
              dependentAxis
              standalone={false}
              domain={yDomainsByUnitType[type]}
              label={label}
              orientation={index > 0 ? "right" : "left"}
              tickFormat={tickFormat}
              scale={{ x: "time", y: "linear" }}
              offsetX={index > 1 ? index * PAD_UNIT : undefined}
              style={{
                axisLabel: {
                  padding: 30,
                },
                grid: activeUnits.length === 1 ? gridlineStyle : undefined,
              }}
            />
          ))}
          {activeItemsWithData.map(({ reading: name, color, data, unit }) => (
            <VictoryLine
              key={name}
              data={data}
              x="timestamp"
              y="value"
              scale={{ x: "time", y: "linear" }}
              domain={yDomainsByUnitType[unit.type]}
              domainPadding={domainPadding}
              standalone={false}
              style={{
                data: {
                  stroke: color,
                },
              }}
            />
          ))}
          {activeItemsWithData.map(
            ({ label, unit, reading: name, color, data }) => (
              <VictoryScatter
                key={name}
                data={data}
                standalone={false}
                scale={{ x: "time", y: "linear" }}
                labels={labelFormatterCreate({
                  label,
                  ...unit,
                })}
                labelComponent={<VictoryTooltip />}
                x="timestamp"
                y="value"
                domain={yDomainsByUnitType[unit.type]}
                domainPadding={domainPadding}
                size={4}
                style={{
                  data: {
                    fill: "white",
                    stroke: color,
                    strokeWidth: 2,
                  },
                  labels: {
                    fontSize: "24px",
                    fill: color,
                  },
                }}
              />
            ),
          )}
          {props.children}
        </g>
      </VictoryContainer>
      {props.fetching && <ChartLoadingIndicator />}
    </>
  );
};
