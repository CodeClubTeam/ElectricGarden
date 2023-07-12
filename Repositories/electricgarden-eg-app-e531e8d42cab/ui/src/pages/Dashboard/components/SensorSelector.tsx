import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Select, { ValueType } from 'react-select';

import { createAppStructuredSelector } from '../../../selectors';
import {
    sensorOptionsSelector,
    sensorsSelector,
    useEnsureSensorsFetched,
} from '../../Hardware';
import { thingToOption } from '../../../utils';

type Props = {
    value?: Sensor;
    onChange?: (value?: Sensor) => void;
    autoSelectFirstOnLoad?: boolean;
};

export const SensorSelector: React.FC<Props> = ({
    value,
    onChange,
    autoSelectFirstOnLoad,
}) => {
    const { options, sensors } = useSelector(
        createAppStructuredSelector({
            options: sensorOptionsSelector,
            sensors: sensorsSelector,
        }),
    );

    const selectedOption = value && thingToOption(value);

    const handleOnChange = useCallback(
        (item: ValueType<Tag, false>) => {
            const findSensorBySerial = (serial: string) =>
                sensors.find((s) => s.serial === serial);
            if (onChange) {
                if (!item) {
                    onChange(undefined);
                    return;
                }
                onChange(findSensorBySerial(item?.value));
            }
        },
        [onChange, sensors],
    );

    useEffect(() => {
        if (autoSelectFirstOnLoad && sensors.length > 0 && !value && onChange) {
            onChange(sensors[0]);
        }
    }, [autoSelectFirstOnLoad, onChange, sensors, value]);

    const fetched = useEnsureSensorsFetched();

    return (
        <div style={{ width: '300px', margin: '0 40px' }}>
            <Select
                options={options}
                value={selectedOption}
                isLoading={!fetched}
                onChange={handleOnChange}
                styles={{
                    control: (base) => ({
                        ...base,
                        backgroundColor: 'white',
                    }),
                    menu: (base) => ({
                        ...base,
                        margin: '1px 0',
                    }),
                }}
                components={{
                    IndicatorSeparator: () => null,
                }}
            />
        </div>
    );
};
