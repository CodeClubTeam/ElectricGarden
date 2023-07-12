import React from "react";
import { useApi } from "../datagraph/useApi";
import { HttpResponseError } from "../shared";

export const useRequestedSensorId = () => {
  const idOrSerial = window.location.pathname.substr(1); // lightweight don't need full react-router for this
  const [notFound, setNotFound] = React.useState(false);
  const id = Number(idOrSerial);
  const { getDeviceFromSerial } = useApi();

  React.useEffect(() => {
    let unmounted = false;
    if (idOrSerial && !id) {
      const serial = idOrSerial;
      getDeviceFromSerial(serial)
        .then((device) => {
          window.location.replace(`/${device.id}`);
        })
        .catch((error) => {
          if (
            error instanceof HttpResponseError &&
            error.response.status === 404
          ) {
            if (!unmounted) {
              setNotFound(true);
            }
          }
        });
      return () => {
        unmounted = true;
      };
    }
  }, [getDeviceFromSerial, id, idOrSerial]);

  return { id, idOrSerial, notFound };
};
