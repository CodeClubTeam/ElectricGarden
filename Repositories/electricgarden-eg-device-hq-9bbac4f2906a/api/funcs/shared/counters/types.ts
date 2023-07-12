export type EncodedCounterEntry = {
  encodingVersion: number;
  timestamp: Date;
  type: number;
  value: number;
};

export type CounterEntry = {
  timestamp: Date;
  name: string;
  value: number;
  error?: boolean;
};
