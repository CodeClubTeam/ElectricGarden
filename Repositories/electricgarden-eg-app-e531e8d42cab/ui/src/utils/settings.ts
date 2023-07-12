export const getRequiredSetting = (key: string): string => {
    const name = `REACT_APP_${key}`;
    if (!(name in process.env)) {
        throw new Error(`Environment variable not found: ${name}.`);
    }
    return process.env[name] ?? '';
};
