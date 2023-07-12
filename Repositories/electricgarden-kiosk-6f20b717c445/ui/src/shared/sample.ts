export interface SampleValuesRaw {
  soilTemp?: number;
  airTemp?: number;
  soilMoisture?: number;
  humidity?: number;
  light?: number;
  co2?: number;
}

export interface SampleRaw extends SampleValuesRaw {
  timestamp: Date;
}

export type SampleValues = {
  [K in keyof SampleValuesRaw]: number | null;
};

export type Sample = {
  timestamp: Date;
} & SampleValues;
