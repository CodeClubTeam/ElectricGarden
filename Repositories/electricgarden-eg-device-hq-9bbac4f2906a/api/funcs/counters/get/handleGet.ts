import { Context } from "@azure/functions";
import { summariseCounters } from "./summariseCounters";
import {
  tabulariseSummaryCounters,
  groupedSummaryCounters,
} from "./tabulariseSummaryCounters";
import {
  decodeCounters,
  EncodedCounterEntry,
  queryCounters,
} from "../../shared";

export const handleGet = async (context: Context, serial: string) => {
  const { req } = context;
  if (!req) {
    throw new Error("no request");
  }

  context.log.info(`Received request of counters for ${serial}.`);

  const { shape = "tabular", format = "json", by = "timestamp" } = req.query;
  context.log.info(`Request query options ${JSON.stringify(req.query)}`);
  context.log.info(
    `Using options: shape=${shape}, format=${format}, by=${by}.`,
  );

  const encodedValues = (await queryCounters(context.log, serial)).map(
    ({
      EncodingVersion,
      ReceivedOn,
      Timestamp,
      Type,
      Value,
    }): EncodedCounterEntry => ({
      encodingVersion: EncodingVersion,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      timestamp: ReceivedOn ? new Date(ReceivedOn) : Timestamp!,
      type: Type,
      value: Value,
    }),
  );
  const decodedValues = decodeCounters(encodedValues);
  const values = summariseCounters(decodedValues);

  // quick CSV
  if (req.headers.accept.includes("text/csv") || format === "csv") {
    context.log.info(`Request wants CSV, converting`);
    const rowValues = tabulariseSummaryCounters(values, {
      rotated: by === "timestamp",
    });
    return {
      res: {
        status: 200,
        headers: {
          ["Content-type"]: "text/csv",
        },
        body: rowValues.join("\n"),
      },
    };
  }
  return {
    res: {
      status: 200,
      body: {
        serial,
        values:
          shape === "grouped"
            ? groupedSummaryCounters(values)
            : shape === "tabular"
            ? tabulariseSummaryCounters(values, {
                rotated: by === "timestamp",
              })
            : values,
      },
    },
  };
};
