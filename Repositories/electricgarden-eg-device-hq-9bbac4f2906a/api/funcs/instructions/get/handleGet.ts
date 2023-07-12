import { Context } from "@azure/functions";
import {
  getDeviceSettings,
  setDeviceHasSettingsToUpdateFlag,
  getEffectiveDeviceSettings,
} from "../../shared";
import { getDeviceInfoOrValidationError } from "../shared";
import { getActions } from "./getActions";

const httpResult = (body: unknown) => ({
  res: {
    status: 200,
    body,
  },
});

export const handleGet = async (
  { log }: Context,
  serial: string,
  aspect = "all",
) => {
  log.info(`Instructions request for: ${serial}; aspect: ${aspect}.`);

  const getDeviceType = async () => {
    const deviceInfo = await getDeviceInfoOrValidationError(log, serial);
    return deviceInfo.type;
  };

  switch (aspect) {
    case "settings": {
      const type = await getDeviceType();
      const settings = await getDeviceSettings(serial, type);
      log.info(`Settings: ${JSON.stringify(settings)}`);
      return httpResult(settings);
    }

    case "actions": {
      const actions = await getActions(log, serial);
      log.info(`Actions: ${JSON.stringify(actions)}`);
      return httpResult(actions);
    }

    case "all": {
      const type = await getDeviceType();
      const settings = await getEffectiveDeviceSettings(serial, type);
      const actions = await getActions(log, serial);
      const all = { serial, settings, actions };
      log.info(`All: ${JSON.stringify(all)}`);

      // we need to know if it is a device responding to 301 from catm1 receiver to get an update
      // I think it should be a custom HTTP header but right now not sure if firmware HTTP API supports it so
      // going to use aspect for now
      log.info(
        `Based on aspect=all, assuming it is a device getting flagged update, clearing flag.`,
      );
      await setDeviceHasSettingsToUpdateFlag(log, serial, false);

      return httpResult(all);
    }

    default:
      return {
        res: {
          status: 400,
          body: { message: `Aspect not recognised: ${aspect}.` },
        },
      };
  }
};
