import fs from 'fs';

import { LessonMetadata } from '../../src/lessons/definition';
import { extractLessonMetadata } from '../../src/lessons/helpers/metadata';
import { convertToUnixSeparators } from './windowsCompat';

export const getContentItemMetadatas = (
    contentPathRoot: string,
    filenames: string[],
) =>
    filenames.map(getContentItemMetadataCreate(contentPathRoot)).filter(
        (
            item,
        ): item is LessonMetadata & {
            contentPath: string;
        } => !!item,
    );

export const getContentItemMetadata = (
    contentPathRoot: string,
    filename: string,
) => getContentItemMetadataCreate(contentPathRoot)(filename);

export const getContentItemMetadataCreate = (contentPathRoot: string) => (
    filename: string,
) => {
    const content = fs.readFileSync(filename, 'utf8');
    try {
        const metadata = extractLessonMetadata(content);

        if (!metadata) {
            return;
        }
        validateMetadata(metadata);
        const contentPath = convertToUnixSeparators(
            filename.replace(contentPathRoot, ''),
        );
        const lesson = {
            ...metadata,
            contentPath,
        };
        return lesson;
    } catch (err) {
        console.error(`Error capturing metadata from ${filename}.`);
        throw err;
    }
};

const validateMetadata = (metadata: LessonMetadata) => {
    const sectionNames = metadata.sections.map((s) => s.name);
    let invalid = false;
    for (const name of sectionNames) {
        if (sectionNames.filter((n) => n === name).length > 1) {
            console.error(
                `Duplicate section name (based off title) in ${metadata.title}: ${name}`,
            );
            invalid = true;
        }
    }
    if (invalid) {
        throw new Error(
            `Invalid lesson: ${metadata.title} (${metadata.name}).`,
        );
    }
};
