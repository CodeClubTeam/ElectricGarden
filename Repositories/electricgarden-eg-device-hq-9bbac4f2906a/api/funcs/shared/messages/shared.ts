import { Message } from "./types";
import shortid from "shortid";

export const createMessage = (messagePart: Omit<Message, "id">) => {
  return {
    id: shortid(),
    ...messagePart,
  } as Message;
};
