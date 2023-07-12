import { azureAsyncFunc, SampleMessage, upsertSampleMetrics } from "../shared";

export default azureAsyncFunc(
  "sample-metrics-updater",
  async ({ log }, message: SampleMessage) => {
    await upsertSampleMetrics(log, message);
  },
);
