import {
  azureHttpFunc,
  paramsWithSerialValidator,
  queryAuditLog,
} from "../shared";
import { optionsSchema } from "./optionsSchema";

export default azureHttpFunc("auditlog-api", async ({ log }, req) => {
  const { serial } = paramsWithSerialValidator.validateSync(req.params);
  const options = optionsSchema.validateSync(req.query);

  log.info(`AuditLog Query Options/Criteria: ${JSON.stringify(options)}`);

  const result = await queryAuditLog(log, serial, options);
  return {
    res: {
      status: 200,
      body: result,
    },
  };
});
