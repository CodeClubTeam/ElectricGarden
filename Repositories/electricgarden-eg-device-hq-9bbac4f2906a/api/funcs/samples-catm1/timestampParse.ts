const currentCentury = Math.floor(new Date().getFullYear() / 100) * 100;

const fNum = (value: number) => value.toString().padStart(2, "0");

export const timestampParse = (value: string): Date => {
  if (!value) {
    throw new Error(`No timestamp.`);
  }
  const [date, time] = value.split(",");
  if (!(date && time)) {
    throw new Error("Invalid timestamp format");
  }

  const dateParts = date.split("/").map((v) => Number(v));
  const timeParts = time.split(":");
  if (
    dateParts.length !== 3 ||
    dateParts.find((part) => !(part >= 0)) !== undefined
  ) {
    throw new Error("Invalid timestamp format");
  }
  if (timeParts.length !== 3) {
    throw new Error("Invalid timestamp format");
  }

  const [year2digits, month, day] = dateParts;
  const [hourStr, minuteStr, secondPlus] = timeParts;
  const [secondStr, timezoneOffsetStr] = secondPlus.split("+");
  const year = currentCentury + year2digits;
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const second = Number(secondStr);
  const timezoneOffset = Number(timezoneOffsetStr) / 4;
  if (
    [hour, minute, second, timezoneOffset].find((part) => !(part >= 0)) !==
    undefined
  ) {
    throw new Error("Invalid timestamp format");
  }

  const isoString = `${year}-${fNum(month)}-${fNum(day)}T${fNum(hour)}:${fNum(
    minute,
  )}:${fNum(second)}.000+${fNum(timezoneOffset)}00`;
  // console.log({
  //   year,
  //   month,
  //   day,
  //   hour,
  //   minute,
  //   second,
  //   timezoneOffset,
  //   isoString,
  // });

  return new Date(isoString);
};

// '19/11/14,13:08:29+52'
