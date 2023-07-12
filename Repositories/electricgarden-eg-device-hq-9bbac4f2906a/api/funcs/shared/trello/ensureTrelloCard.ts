import { Logger } from "@azure/functions";
import { getRequiredSetting } from "../getRequiredSetting";
import { DeviceInfo } from "../records";
import { getDeviceInfo, upsertDevice } from "../tables";
import { getTemplateValues, getTrello } from "./shared";
import formatString from "string-format-obj";

type Versions = {
  firmware?: string;
  hardware?: string;
};

// TODO: probably should put these in app settings at some stage
const descParams = (serial: string) => ({
  DEVICE_HQ_LINK: `https://egdevicehqappstoreprod.z8.web.core.windows.net/devices/${serial}`,
  EG_HARDWARE_SUPPORT_LINK: `https://app.electricgarden.nz/admin/support/hardware/${serial}`, // assuming prod
  EG_DATA_GRAPH_LINK: `https://app.electricgarden.nz/data`, // TODO: support intermediary redirecting link in app for SU users to the sensor by serial
  EG_OUR_GARDEN_LINK: `https://app.electricgarden.nz/garden`, // id is growable id so need intermediary redirector
});

const nameParams = (serial: string, versions: Versions) => ({
  SERIAL_NUMBER: serial,
  HARDWARE_VERSION: versions.hardware ?? "",
  FIRMWARE_VERSION: versions.firmware ?? "",
});

export const ensureTrelloCard = async (
  log: Logger,
  device: DeviceInfo,
  versions: Versions,
  update: Versions,
): Promise<DeviceInfo> => {
  const { serial } = device;
  if (device.trelloCardId) {
    log.info(
      `Found device with trello card id: ${device?.trelloCardId}. Serial: ${serial}.`,
    );
    if (
      update.firmware === versions.firmware &&
      update.hardware === versions.hardware
    ) {
      log.info(
        `Firmware and hardware version unchanged. Skipping trello card name update.`,
      );
      return device;
    }
    log.info(
      `Firmware and hardware version changed. F${versions.firmware}->${versions.firmware}; H${versions.hardware}->${update.hardware}`,
    );
  } else {
    log.info(`No trello id found for serial: ${serial}.`, device);
  }

  const trello = getTrello();
  const templateValues = await getTemplateValues(log);
  const desc = formatString(templateValues.desc, descParams(serial));
  const cardName = formatString(
    templateValues.name,
    nameParams(serial, update),
  );

  if (!device.trelloCardId) {
    const trelloListId = getRequiredSetting("TRELLO_LIST_ID_ACTIVATED");
    const trelloTemplateCardId = getRequiredSetting("TRELLO_TEMPLATE_CARD_ID");
    log.info(
      `Adding trello card for serial: ${serial} to list id: ${trelloListId} with name: ${cardName} using template id: ${trelloTemplateCardId}.`,
    );

    const result = await trello.addCardWithExtraParams(
      cardName,
      {
        idCardSource: trelloTemplateCardId,
        keepFromSource:
          "attachments,checklists,comments,labels,members,stickers", // all except "due"
        desc,
      },
      trelloListId,
    );
    const trelloCardId = result.id;
    log.info(`Upserting device to populate trello card id: ${result.id}.`);
    await upsertDevice(log, { ...device, trelloCardId });

    const updated = await getDeviceInfo(log, serial);
    if (!updated) {
      throw new Error(`Updated device not found`); // should never happen
    }
    return updated;
  } else {
    log.info(`Updating trello card name for serial: ${serial} to ${cardName}.`);
    await trello.updateCardName(device.trelloCardId, cardName);
  }
  return device;
};
