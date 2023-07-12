if (process.env.NODE_ENV !== "production") {
  /* eslint-disable @typescript-eslint/no-var-requires */
  require("dotenv").config();
}

export const getRequiredSetting = (key: string): string => {
  if (!(key in process.env)) {
    if (process.env.NODE_ENV === "test") {
      return `Environment variable not found: ${key}`;
    } else {
      throw new Error(`Environment variable not found ${key}`);
    }
  }
  return process.env[key] ?? "";
};
