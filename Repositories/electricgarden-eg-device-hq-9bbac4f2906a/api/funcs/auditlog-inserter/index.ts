import { azureAsyncFunc, mapMessageToAuditLogRecord, Message } from "../shared";

export default azureAsyncFunc(
  "auditlog-inserter",
  async (context, message: Message) => {
    context.log(`Auditing: ${JSON.stringify(message)}`);

    return {
      auditlog: mapMessageToAuditLogRecord(message),
    };
  },
);
