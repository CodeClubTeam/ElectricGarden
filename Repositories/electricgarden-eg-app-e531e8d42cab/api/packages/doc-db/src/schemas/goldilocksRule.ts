import { sampleMetrics, SampleMetric } from '../config';
import mongoose from '../db';

export interface GoldilocksRuleProperties {
  title: string;
  metric: SampleMetric;
  min?: number;
  max?: number;
}

export interface GoldilocksRuleDocument
  extends mongoose.Document,
    GoldilocksRuleProperties {}

export const goldlocksRuleSchema = new mongoose.Schema<GoldilocksRuleDocument>({
  title: {
    type: String,
    required: true,
  },
  metric: {
    type: String,
    enum: sampleMetrics,
    required: true,
  },
  min: Number,
  max: Number,
});

export const GoldilocksRule = mongoose.model<GoldilocksRuleDocument>(
  'GoldilocksRule',
  goldlocksRuleSchema,
);
