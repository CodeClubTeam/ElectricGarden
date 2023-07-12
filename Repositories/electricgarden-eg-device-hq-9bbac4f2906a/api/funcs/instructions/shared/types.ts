import {
  ResultWithHttpResponse,
  EventHubResponse,
  ActionRecord,
} from "../../shared";

interface ActionRecordTableInsertResponse {
  table: ActionRecord[];
}

export interface InstructionsBindings
  extends Partial<EventHubResponse>,
    Partial<ActionRecordTableInsertResponse> {}

export interface InstructionsResponse
  extends ResultWithHttpResponse,
    InstructionsBindings {}
