import { useMutation, useQuery, queryCache } from "react-query";
import { useDeviceDefaultSettingsApi } from "./useDeviceDefaultSettingsApi";
import { DeviceSettings, DeviceType } from "../../shared";

const queryKey = (type: DeviceType) => `default-settings/${type}`;

export const useFetchDefaultSettings = (type: DeviceType) => {
  const { getDefaultSettings } = useDeviceDefaultSettingsApi(type);
  return useQuery(queryKey(type), getDefaultSettings);
};

export const usePutDefaultSettings = (type: DeviceType) => {
  const { putDefaultSettings } = useDeviceDefaultSettingsApi(type);

  const [mutateSettings] = useMutation(
    (settings: DeviceSettings) => putDefaultSettings(type, settings),
    {
      onSuccess: () => queryCache.invalidateQueries(queryKey(type)),
      onError: (error) => {
        alert(`Failed to submit default settings: ${error.message}`);
      },
    },
  );
  return mutateSettings;
};
