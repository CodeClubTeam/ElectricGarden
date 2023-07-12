import { useQuery, useMutation, queryCache } from "react-query";
import { DeviceAction } from "../types";
import { useDeviceApi } from "./useDeviceApi";

const queryKey = (serial: string) => `${serial}/actions`;

export const useFetchActions = (serial: string) => {
  const { getActions } = useDeviceApi(serial);
  return useQuery(queryKey(serial), getActions);
};

export const usePutActions = (serial: string) => {
  const { putActions } = useDeviceApi(serial);

  const [mutateActions] = useMutation(
    async (actions: DeviceAction[]) => putActions(serial, actions),
    {
      onSuccess: () => queryCache.invalidateQueries(queryKey(serial)),
      onError: (error) => {
        alert(`Failed to submit actions: ${error.message}`);
      },
    },
  );
  return mutateActions;
};
