#!/usr/bin/env ts-node --files -P ./scripts/tsconfig.json -r dotenv/config

// generates the lessons/getMarkdownContent.ts file which has all the dynamic
// imports to chunk the lesson content at build time
import fs from 'fs';
import path from 'path';
import {
    getContentFilenames,
    convertToUnixSeparators,
    getContentItemMetadatas,
} from './helpers';
import { extractLessonMetadata } from '../src/lessons/helpers/metadata';
import slugify from 'slugify';
import { uniqBy } from 'lodash';

const VALID_LESSON_FILENAME_REGEX = /^[a-z0-9-/]+\.mdx?$/;
const VALID_IMAGE_FILENAME_REGEX = /^[a-z0-9-/]+\.(png|jpe?g|gif)$/;

const contentPathRoot = path.resolve('./src/lessons/content');

const validateLessonFilename = (name: string) => {
    if (!VALID_LESSON_FILENAME_REGEX.test(name)) {
        const message = `Invalid filename ${name}. Names must be lowercase, have no spaces and include only - and numbers.`;
        throw new Error(message);
    }
};

const validateImageFilenameCreate = (lessonFilename: string) => (
    path: string,
) => {
    const segments = path.split(/[/\\]/);
    const filename = segments[segments.length - 1];
    if (
        segments.find((s) => s.toLowerCase() !== s) ||
        !VALID_IMAGE_FILENAME_REGEX.test(filename)
    ) {
        const message =
            `Invalid image path '${path}' in lesson: '${lessonFilename}'.\n` +
            `Paths must be lowercase, have no spaces and include only - and numbers, end in jpg,gif,png.`;
        throw new Error(message);
    }
};

const getRelativePath = (longName: string) =>
    convertToUnixSeparators(longName.replace(contentPathRoot, ''));

const getValidatedContentFilenames = () => {
    const contentFilenames = getContentFilenames(contentPathRoot)
        .map(getRelativePath)
        .sort();

    contentFilenames.map(validateLessonFilename);
    return contentFilenames;
};

const buildLessonIndex = async () => {
    const lessonFilenames = getValidatedContentFilenames();
    const cases = lessonFilenames.map((filename) => {
        const chunkName =
            'lesson--' + filename.substring(1).replace(/\//g, '-');
        return `
        case '${filename}':
            return import(
                '.${filename}' /* webpackChunkName: "${chunkName}" */
            );`;
    });
    const fileContent = `
// GENERATED CODE
// See ./scripts/lesson-index-build.ts
//
// just so that webpack will do it's thing and put the md files in build folder statics, hashed etc

export const getMarkdownContent = async (contentPath: string) => {
    switch (contentPath) {${cases.join('\n')}

        default:
            return undefined;
    }
};
`;
    const outputPath = path.resolve(
        './src/lessons/content/getMarkdownContent.ts',
    );
    fs.writeFileSync(outputPath, fileContent);
};

const buildCoverImageIndex = () => {
    const lessonFilenames = getContentFilenames(contentPathRoot);

    type Item = {
        filename: string;
        coverImagePath: string;
        importName: string;
    };

    const items = lessonFilenames
        .map((filename) => {
            const content = fs.readFileSync(filename, 'utf8');
            const metadata = extractLessonMetadata(content);
            if (!metadata || !metadata.coverImagePath) {
                return undefined;
            }
            const relativeFilename = getRelativePath(filename);
            const coverImagePath = metadata.coverImagePath.replace(/^.\//, '')!;
            validateImageFilenameCreate(relativeFilename)(coverImagePath);
            const fullCoverImagePath =
                '.' + relativeFilename.replace(/[^./]+\.mdx?$/, coverImagePath);
            return {
                filename: relativeFilename,
                coverImagePath: fullCoverImagePath,
                importName: slugify(coverImagePath, {
                    replacement: '',
                    remove: /[./-]/g,
                    lower: true,
                }),
            };
        })
        .filter((v): v is Item => !!v);

    const uniqueByImportItems = uniqBy(items, 'importName');

    // prettier-ignore
    const fileContent = `
/* eslint-disable no-useless-computed-key */

// GENERATED CODE
// See ./scripts/lesson-index-build.ts
//
// just so that webpack will do it's thing and put the files in build folder statics, hashed etc
${uniqueByImportItems.map(
        ({ importName, coverImagePath }) =>
            `import ${importName} from '${coverImagePath}';`,
    ).join('\n')}

const imagePathsByContentPath: Record<string, string> = {
    ${items.map(
        ({ importName, filename }) => `['${filename}']: ${importName}`).join(',\n')}
}

export const getCoverImagePath = (contentPath: string) => imagePathsByContentPath[contentPath];
`;
    const outputPath = path.resolve('./src/lessons/content/getCoverImage.ts');
    fs.writeFileSync(outputPath, fileContent);
};

const buildFacilitationIndex = async () => {
    const contentPathRoot = path.resolve('./src/lessons/content');
    const contentFilenames = getContentFilenames(contentPathRoot);

    const guideItems = getContentItemMetadatas(
        contentPathRoot,
        contentFilenames,
    ).filter((item) => item.type === 'facilitation-guide');
    for (const item of guideItems) {
        delete item.sections;
    }

    const outputPath = path.resolve(
        './src/lessons/content/facilitation-guides-index.json',
    );
    fs.writeFileSync(outputPath, JSON.stringify(guideItems, undefined, '  '));
};

const buildGiantsIndex = async () => {
    const contentPathRoot = path.resolve('./src/lessons/content');
    const contentFilenames = getContentFilenames(contentPathRoot);

    const guideItems = getContentItemMetadatas(
        contentPathRoot,
        contentFilenames,
    ).filter((item) => item.type === 'giants-guide');
    for (const item of guideItems) {
        delete item.sections;
    }

    const outputPath = path.resolve(
        './src/lessons/content/giants-guides-index.json',
    );
    fs.writeFileSync(outputPath, JSON.stringify(guideItems, undefined, '  '));
};

Promise.all([
    buildLessonIndex(),
    buildCoverImageIndex(),
    buildFacilitationIndex(),
    buildGiantsIndex(),
]).catch((err) => {
    console.error(err);
    process.exit(1);
});
