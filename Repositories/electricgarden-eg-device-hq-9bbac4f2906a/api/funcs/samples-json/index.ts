import shortid from "shortid";

import { azureHttpFuncForEventHub, SampleMessage } from "../shared";
import { payloadSchema } from "./sampleSchema";

interface SuccessResponse {
  res: {
    status: 204 | 400;
    body: null;
  };
  messagesToEventHub: SampleMessage[];
}

export default azureHttpFuncForEventHub(
  "samples-json",
  async (context, req): Promise<SuccessResponse> => {
    context.log.info("Received payload", req.body);

    const { serial, samples } = payloadSchema.validateSync(req.body);

    const message: SampleMessage = {
      type: "sample",
      id: shortid(),
      timestamp: new Date(),
      source: "admin",
      serial,
      content: samples.map(
        ({
          timestamp,
          soilMoisture,
          airTemp,
          humidity,
          light,
          soilTemp,
          battery,
          errorCode,
          rssi,
          snr,
          co2,
        }) => ({
          timestamp,
          probeMoisture: soilMoisture,
          ambientTemp: airTemp,
          ambientHumidity: humidity,
          probeAirTemp: airTemp,
          probeSoilTemp: soilTemp,
          light,
          batteryVoltage: battery,
          errorCode,
          rssi,
          snr,
          co2,
        }),
      ),
    };

    return {
      messagesToEventHub: [message],
      res: {
        status: 204,
        body: null,
      },
    };
  },
);
