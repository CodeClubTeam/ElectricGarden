export const getMinuteOfDay = (timestamp: Date) =>
  timestamp.getHours() * 60 + timestamp.getMinutes();
