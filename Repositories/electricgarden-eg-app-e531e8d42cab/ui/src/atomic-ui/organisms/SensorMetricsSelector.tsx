import React from 'react';
import { useSelector } from 'react-redux';

import { SensorMetric, sensorMetricsSelector } from '../../metrics';
import { ColoredCheckbox } from '../atoms';
import { VisibleChartItems } from '../organisms/chart';

interface Props {
    value: VisibleChartItems;
    onChange: (state: VisibleChartItems) => void;
    filter?: (metric: SensorMetric) => boolean;
}

export const SensorMetricsSelector: React.FC<Props> = ({
    onChange,
    value,
    filter = () => true,
}) => {
    const metrics = useSelector(sensorMetricsSelector);
    const includedMetrics = metrics.filter(filter);
    return (
        <>
            {includedMetrics.map(({ type: name, color, label }) => (
                <ColoredCheckbox
                    key={name}
                    name={name}
                    selectedColor={color}
                    selected={value[name]}
                    onChange={(selected) =>
                        onChange({
                            ...value,
                            [name]: selected,
                        })
                    }
                >
                    {label}
                </ColoredCheckbox>
            ))}
        </>
    );
};
