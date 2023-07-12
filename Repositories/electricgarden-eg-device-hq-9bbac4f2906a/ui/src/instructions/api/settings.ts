import { useMutation, useQuery, queryCache } from "react-query";
import { useDeviceApi } from "./useDeviceApi";
import { DeviceSettings } from "../../shared";

const queryKey = (serial: string) => `${serial}/settings`;

export const useFetchSettings = (serial: string) => {
  const { getSettings } = useDeviceApi(serial);
  return useQuery(queryKey(serial), getSettings);
};

export const usePutSettings = (serial: string) => {
  const { putSettings } = useDeviceApi(serial);

  const [mutateSettings] = useMutation(
    (settings: DeviceSettings) => putSettings(serial, settings),
    {
      onSuccess: () => queryCache.invalidateQueries(queryKey(serial)),
      onError: (error) => {
        alert(`Failed to submit settings: ${error.message}`);
      },
    },
  );
  return mutateSettings;
};
