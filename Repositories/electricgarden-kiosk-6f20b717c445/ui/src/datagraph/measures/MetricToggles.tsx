import React from "react";
import styled from "styled-components/macro";

import { Measure } from "../selectors";
import { MeasureValue } from "./MeasureValue";
import { MetricToggleButton } from "./MetricToggleButton";
import { MetricType } from "../../shared";

const List = styled.ul`
  display: flex;
  list-style-image: none;
  padding: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

const ListItem = styled.li`
  display: inline-flex;
  margin: 4px;
  transition: all 0.1s ease-in-out;
  --border-radius: 4px;
`;

type Props = {
  latestMeasures: Measure[];
  selectedTypes: MetricType[];
  onToggle: (type: MetricType) => void;
};

export const MetricToggles: React.FC<Props> = ({
  latestMeasures,
  selectedTypes,
  onToggle,
}) => (
  <List>
    {latestMeasures.map(({ metric: { type }, metric, value }) => (
      <ListItem key={type}>
        <MetricToggleButton
          type={type}
          selected={selectedTypes.includes(type)}
          onToggle={() => onToggle(type)}
        >
          <MeasureValue metric={metric} value={value} />
        </MetricToggleButton>
      </ListItem>
    ))}
  </List>
);
