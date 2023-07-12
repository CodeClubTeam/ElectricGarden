import path from 'path';

export const convertToUnixSeparators = (filepath: string) => {
    if (path.sep === '/') {
        return filepath;
    }
    return filepath.split(path.sep).join('/');
};
