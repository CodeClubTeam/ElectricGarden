import { Metric } from '../../../metrics';

export type Measure = {
    metric: Metric;
    value: number | null;
};
