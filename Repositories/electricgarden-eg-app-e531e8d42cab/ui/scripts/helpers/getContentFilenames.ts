import fs from 'fs';
import path from 'path';

export const getContentFilenames = (dirPath: string) => {
    let filenames: string[] = [];
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            filenames = [
                ...filenames,
                ...getContentFilenames(path.join(dirPath, entry.name)),
            ];
        } else {
            if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
                filenames.push(path.join(dirPath, entry.name));
            }
        }
    }
    return filenames;
};
