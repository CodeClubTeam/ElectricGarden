import React, { useCallback } from 'react';
import {
    VisibleChartItems,
    MetricToggles,
    Measure,
} from '../../../../atomic-ui';
import { MetricType } from '../../../../metrics';

type Props = {
    value: VisibleChartItems;
    onChange: (state: VisibleChartItems) => void;
    latestMeasures: Measure[];
    valueComponent: React.ComponentType<Measure>;
};

export const MeasureToggles = ({
    value,
    onChange,
    latestMeasures,
    valueComponent,
}: Props) => {
    const handleToggle = useCallback(
        (type: MetricType) => {
            onChange({
                ...value,
                [type]: !value[type],
            });
        },
        [onChange, value],
    );

    const selectedTypes = Object.entries(value)
        .filter(([, selected]) => !!selected)
        .map(([type]) => type);

    return (
        <MetricToggles
            selectedTypes={selectedTypes}
            onToggle={handleToggle}
            latestMeasures={latestMeasures}
            valueComponent={valueComponent}
        />
    );
};
