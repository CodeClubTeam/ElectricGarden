import React from "react";

import { DataVisualisation } from "../datagraph";
import { NoSensorInUrl } from "./NoSensorInUrl";
import { NotFound } from "./NotFound";
import { useRequestedSensorId } from "./useRequestedSensorId";

export const Startup = () => {
  const { id, idOrSerial, notFound } = useRequestedSensorId();

  if (id) {
    return <DataVisualisation id={id} />;
  }
  if (!idOrSerial) {
    return <NoSensorInUrl />;
  }
  if (notFound) {
    return <NotFound idOrSerial={idOrSerial} />;
  }

  return <p>Loading...</p>;
};
