// tidied up from https://stackoverflow.com/a/17415677
export const getDateISOStringLocaltime = (ts: Date) => {
  const tzo = -ts.getTimezoneOffset(),
    dif = tzo >= 0 ? "+" : "-",
    pad = function (num: number) {
      const norm = Math.floor(Math.abs(num));
      return (norm < 10 ? "0" : "") + norm;
    };
  return (
    ts.getFullYear() +
    "-" +
    pad(ts.getMonth() + 1) +
    "-" +
    pad(ts.getDate()) +
    "T" +
    pad(ts.getHours()) +
    ":" +
    pad(ts.getMinutes()) +
    ":" +
    pad(ts.getSeconds()) +
    dif +
    pad(tzo / 60) +
    ":" +
    pad(tzo % 60)
  );
};
