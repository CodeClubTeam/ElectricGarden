import fetch from "node-fetch";

import { generateUniqueTitle } from "./generateUniqueTitle";
import { getRequiredSetting } from "../shared";

const RAYGUN_API_KEY = getRequiredSetting("RAYGUN_API_KEY");
const RAYGUN_ENDPOINT = "https://api.raygun.io/entries";

export const reportError = async (
  serial: string,
  message: string,
  traceback?: string,
) => {
  const response = await fetch(RAYGUN_ENDPOINT, {
    method: "POST",
    headers: {
      "X-ApiKey": RAYGUN_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      details: {
        machineName: serial,
        error: {
          message: generateUniqueTitle(message, traceback ?? ""),
        },
        user: {
          identifier: serial,
        },
        data: {
          traceBack: traceback,
        },
      },
      occurredOn: new Date(),
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to send error to raygun. Response status: ${response.status}`,
    );
  }
};
