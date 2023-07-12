export type SoilMoistureRecord = {
    type: 'soilMoisture';
    data: {
        percent: number;
    };
};

export type AirTemperatureRecord = {
    type: 'airTemp';
    data: {
        degrees: number;
    };
};

export type SoilTemperatureRecord = {
    type: 'soilTemp';
    data: {
        degrees: number;
    };
};

export type HumidityRecord = {
    type: 'humidity';
    data: {
        percent: number;
    };
};

export type LightRecord = {
    type: 'light';
    data: {
        lux: number;
    };
};

export type SensorObservation =
    | SoilMoistureRecord
    | AirTemperatureRecord
    | SoilTemperatureRecord
    | HumidityRecord
    | LightRecord;
