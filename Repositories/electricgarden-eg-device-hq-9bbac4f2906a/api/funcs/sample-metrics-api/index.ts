import { azureHttpFunc } from "../shared";
import { querySampleMetrics } from "../shared/tables/sampleMetrics/querySampleMetrics";
import * as yup from "yup";

const lastReceivedCriteriaSchema = yup.object({
  from: yup.date(),
  to: yup.date(),
});

export default azureHttpFunc("sample-metrics-api", async ({ log }, req) => {
  const criteria: Parameters<typeof querySampleMetrics>[1] = {};
  criteria.lastReceived = lastReceivedCriteriaSchema.validateSync(req.query);

  return {
    res: {
      status: 200,
      body: await querySampleMetrics(log, criteria),
    },
  };
});
