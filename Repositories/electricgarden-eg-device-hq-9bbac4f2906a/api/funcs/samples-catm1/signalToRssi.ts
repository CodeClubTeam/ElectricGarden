export const signalToRssi = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }
  if (isNaN(parseInt(value, 10))) {
    return undefined;
  }
  const signal = Number(value);
  if (signal >= 0 && signal <= 31) {
    return -113 + signal * 2;
  } else {
    return undefined;
  }
};
