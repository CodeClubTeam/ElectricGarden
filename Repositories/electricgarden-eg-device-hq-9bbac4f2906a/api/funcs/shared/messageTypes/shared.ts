export interface Message {
  type: string;
  serial: string;
  timestamp: Date;
  source?: MessageSource;
  id: string;
  content?: unknown;
}

export interface MessageWithContent<T> extends Omit<Message, "content"> {
  content: T;
}

export type TimeSyncMinuteOfDays = {
  device: number;
  clock: number;
};

export type MessageSource = "device" | "admin";
