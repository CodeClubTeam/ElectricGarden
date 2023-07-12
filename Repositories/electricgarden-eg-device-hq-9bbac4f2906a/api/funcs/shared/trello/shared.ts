import Trello from "trello";
import { Logger } from "@azure/functions";
import { getRequiredSetting } from "../getRequiredSetting";
import { memoize } from "lodash";
import fetch from "node-fetch";

export const getTrello = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new Trello(
    getRequiredSetting("TRELLO_API_KEY"),
    getRequiredSetting("TRELLO_API_TOKEN"),
  );
};

type TemplateValues = {
  name: string;
  desc: string;
};

// build in trello lib wants board id while REST api doesn't care
export const getCard = async (id: string) => {
  const response = await fetch(
    `https://api.trello.com/1/cards/${id}?key=${getRequiredSetting(
      "TRELLO_API_KEY",
    )}&token=${getRequiredSetting("TRELLO_API_TOKEN")}`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch card with id: ${id}. ${response.status} ${
        response.statusText
      } ${await response.text()}`,
    );
  }
  return response.json();
};

export const getTemplateValues = memoize(
  async (log: Logger): Promise<TemplateValues> => {
    const trelloTemplateCardId = getRequiredSetting("TRELLO_TEMPLATE_CARD_ID");
    const templateCard = await getCard(trelloTemplateCardId);
    if (!templateCard) {
      log.warn(
        `Template card could not be retrieved. Id: ${trelloTemplateCardId}`,
      );
      return {
        name: "{{SERIAL}} H{{HARDWARE_VERSION}} F{{FIRMWARE_VERSION}}",
        desc: "",
      };
    }

    const { name, desc } = templateCard;

    return {
      name,
      desc,
    };
  },
);
