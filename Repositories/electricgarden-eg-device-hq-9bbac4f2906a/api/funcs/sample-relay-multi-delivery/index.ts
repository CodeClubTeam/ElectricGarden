import { azureAsyncFunc, deliverSample, SampleDelivery } from "../shared";

export default azureAsyncFunc(
  "sample-relay-multi-delivery",
  async ({ log }, sampleDelivery: SampleDelivery) => {
    await deliverSample(log, sampleDelivery);
  },
);
