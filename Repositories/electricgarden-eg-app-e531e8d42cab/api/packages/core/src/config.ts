export const getRequiredConfig = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV === 'test') {
      return `Environment variable not found should this be mocked?: ${key}`;
    } else {
      throw new Error(`Environment variable not found ${key}`);
    }
  }
  return value;
};
