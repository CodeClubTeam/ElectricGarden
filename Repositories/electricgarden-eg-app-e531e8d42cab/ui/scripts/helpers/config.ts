export const getRequiredConfig = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable not found ${key}`);
    }
    return value;
};
