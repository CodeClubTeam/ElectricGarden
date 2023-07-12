import moment from "moment";

export const formatDateTime = (value: string | Date) =>
  moment(value).format("HH:mm DD-M-YYYY");
