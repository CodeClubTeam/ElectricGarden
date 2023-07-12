import { restoreLux } from '../utils/dataPoints';

export type UnitDefinition = {
    type: string;
    suffix: string;
    valueTransform?: (value: number) => number;
    axis: {
        label: string;
        orientation: 'right' | 'left';
        offset: number; // TODO this could be more sophisticated e.g. calc based on label instead
        tickFormat?: (
            tick: any,
            index: number,
            ticks: any[],
        ) => React.ReactText;
    };
};

export const temperatureUnit: UnitDefinition = {
    type: 'celcius',
    suffix: '°C',
    axis: {
        label: 'Degrees Celsius (°C)',
        orientation: 'left',
        offset: 60,
    },
};

export type TemperatureUnit = typeof temperatureUnit;

export const lightUnit: UnitDefinition = {
    type: 'lux',
    suffix: 'Lux',
    valueTransform: restoreLux,
    axis: {
        label: 'Lux',
        orientation: 'right',
        offset: 140,
        tickFormat: (value) => `${(restoreLux(value) || 1).toExponential(0)}`,
    },
};

export type LightUnit = typeof lightUnit;

export const percentUnit: UnitDefinition = {
    type: 'percent',
    suffix: '%',
    axis: {
        label: 'Percent',
        orientation: 'right',
        offset: 60,
    },
};

export type PercentUnit = typeof percentUnit;

export const measureUnit: UnitDefinition = {
    type: 'measure',
    suffix: 'cm',
    axis: {
        label: 'cm',
        orientation: 'right',
        offset: 140, // same area as lux
    },
};

export type MeasureUnit = typeof measureUnit;

export type Unit = TemperatureUnit | LightUnit | PercentUnit | MeasureUnit;

export type UnitType = Unit['type'];
