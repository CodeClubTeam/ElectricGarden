import React from "react";
import styled from "styled-components/macro";
import { Chart, HttpResponseError } from "../shared";
import { DateRangeSelector } from "./daterange";
import { SensorMetricToggles } from "./measures/SensorMetricToggles";
import { SensorDetails } from "./SensorDetails";
import { useDataState } from "./state";
import { useFetchSamples } from "./useFetchSamples";

const SensorDetailsContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ChartContainer = styled.div`
  border: 2px solid ${({ theme }) => theme.active};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.bg};
  margin: auto;

  --chart-width: 45vw;
  --chart-width-max: 700px;
  @media (max-width: 1023px) {
    --chart-width: 95vw;
  }
  width: var(--chart-width);
  max-width: var(--chart-width-max);
  height: calc(var(--chart-width) * 0.66);
  max-height: calc(var(--chart-width-max) * 0.66);
`;

const DateRangeAndSensorBlock = styled.div`
  margin-top: 1em;
  display: flex;
  justify-content: center;
`;

const DateRangeSelectorContainer = styled.div``;

const MeasuresContainer = styled.div`
  margin-top: 1em;
`;

export const DataVisualisationDisplay = () => {
  const fetchResult = useFetchSamples();
  const { chartItems, dateRange: fetchingDateRange } = useDataState();

  if (fetchResult.status === "loading") {
    return (
      <ChartContainer>
        <Chart
          data={[]}
          dateRange={fetchingDateRange}
          fetching={true}
          items={chartItems}
        />
      </ChartContainer>
    );
  }

  if (fetchResult.status === "error") {
    const { error } = fetchResult;
    if (error instanceof HttpResponseError && error.response.status === 404) {
      return <p>Sensor not found.</p>;
    }
    return <p>Error retrieving sensor data.</p>;
  }

  const { samples, dateRange, sensor } = fetchResult;

  return (
    <>
      <SensorDetailsContainer>
        <SensorDetails {...sensor} />
      </SensorDetailsContainer>
      <ChartContainer>
        <Chart
          data={samples}
          dateRange={dateRange}
          fetching={false}
          items={chartItems}
        />
      </ChartContainer>
      <DateRangeAndSensorBlock>
        <DateRangeSelectorContainer>
          <DateRangeSelector />
        </DateRangeSelectorContainer>
      </DateRangeAndSensorBlock>
      <MeasuresContainer>
        <SensorMetricToggles />
      </MeasuresContainer>
    </>
  );
};
