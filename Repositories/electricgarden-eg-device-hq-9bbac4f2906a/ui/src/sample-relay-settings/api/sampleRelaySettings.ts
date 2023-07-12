import { queryCache, useMutation, useQuery } from "react-query";
import { SampleRelaySettings } from "../../shared";
import { useSampleRelaySettingsApi } from "./useSampleRelaySettingsApi";

const queryKey = (serial?: string) => `sample-relay-settings/${serial}`;

export const useFetchSampleRelaySettings = (serial?: string) => {
  const { getSettings, getDefaultSettings } = useSampleRelaySettingsApi();
  return useQuery(queryKey(serial), () =>
    serial ? getSettings(serial) : getDefaultSettings(),
  );
};

export const usePutSampleRelaySettings = (serial?: string) => {
  const { putSettings, putDefaultSettings } = useSampleRelaySettingsApi();

  const [mutateSettings] = useMutation(
    (settings: SampleRelaySettings) =>
      serial ? putSettings(serial, settings) : putDefaultSettings(settings),
    {
      onSuccess: () => queryCache.invalidateQueries(queryKey(serial)),
      onError: (error) => {
        alert(`Failed to submit default settings: ${error.message}`);
      },
    },
  );
  return mutateSettings;
};
