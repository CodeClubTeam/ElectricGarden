import React from 'react';
import styled from 'styled-components/macro';

import { MetricToggleButton } from './MetricToggleButton';
import { Metric } from '../../../metrics';
import { Measure } from './types';

const List = styled.ul`
    display: flex;
    list-style-image: none;
    padding: 0;
    flex-flow: wrap;
`;

const ListItem = styled.li`
    display: inline-block;
    margin: 4px;
    transition: all 0.1s ease-in-out;
    --border-radius: 4px;
`;

type MetricType = Metric['type'];

type Props = {
    latestMeasures: Measure[];
    selectedTypes: MetricType[];
    onToggle: (type: MetricType) => void;
    valueComponent: React.ComponentType<Measure>;
};

export const MetricToggles: React.FC<Props> = ({
    latestMeasures,
    selectedTypes,
    onToggle,
    valueComponent: ValueComponent,
}) => (
    <List>
        {latestMeasures.map(({ metric: { type }, metric, value }) => (
            <ListItem key={type}>
                <MetricToggleButton
                    type={type}
                    selected={selectedTypes.includes(type)}
                    onToggle={() => onToggle(type)}
                >
                    <ValueComponent metric={metric} value={value} />
                </MetricToggleButton>
            </ListItem>
        ))}
    </List>
);
