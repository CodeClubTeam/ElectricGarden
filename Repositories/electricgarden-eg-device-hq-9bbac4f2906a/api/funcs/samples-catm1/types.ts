import { Sample } from "../shared";

export type SampleWithOptionalTimestamp = Partial<Sample>;

export type SamplesWithSerial = {
  serial: string;
  samples: SampleWithOptionalTimestamp[];
};

export type Converter = (entries: string[]) => SamplesWithSerial;
