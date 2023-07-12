export type ActionRecord = {
  PartitionKey: string;
  RowKey: string;
  Serial: string;
  Type: string;
  Payload?: Record<string, unknown>;
  Archived: boolean;
};

export type Action = {
  type: string;
  payload?: any;
};

export const createActionRecord = (
  serial: string,
  instruction: { type: string; payload?: Record<string, unknown> },
): ActionRecord => {
  const { type, payload } = instruction;
  if (!type) {
    throw new Error(`Instruction must have type property`);
  }
  return {
    PartitionKey: serial,
    RowKey: `${serial}_${instruction.type}_${Date.now() / 1000}`,
    Serial: serial,
    Type: type,
    Payload: payload,
    Archived: false,
  };
};
