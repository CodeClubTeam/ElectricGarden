import { MetricType, Sample } from "../../shared";

export const metricTypesInSamples = (samples: Sample[]): MetricType[] => {
  const types: MetricType[] = [];
  // inefficient but probably doesn't matter unless large data
  for (const sample of samples) {
    for (const type of Object.keys(sample).filter((k) => k !== "timestamp")) {
      if (!types.includes(type)) {
        types.push(type);
      }
    }
  }
  return types;
};
