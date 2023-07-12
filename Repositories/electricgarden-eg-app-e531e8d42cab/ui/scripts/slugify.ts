#!/usr/bin/env ts-node --files -P ./scripts/tsconfig.json -r dotenv/config
import fs from 'fs';
import path from 'path';

import { extractLessonMetadata } from '../src/lessons/helpers/metadata';
import { getContentFilenames } from './helpers';
import {
    generateNameFromHeadingCreate,
    getExistingSlugFromHeading,
} from '../src/lessons/helpers/sectionNames';

// generates the lessons/getMarkdownContent.ts file which has all the dynamic
// imports to chunk the lesson content at build time
// import { uniqBy } from 'lodash';
const contentPathRoot = path.resolve('./src/lessons/content');

const setupSectionHeadingSlugs = (content: string) => {
    const generateNameFromHeading = generateNameFromHeadingCreate();
    return content.replace(/^## (.+)$/gm, (match, heading) => {
        const existingSlug = getExistingSlugFromHeading(heading);
        if (existingSlug) {
            generateNameFromHeading(heading); // register occurrence for duplicates later
            return match; // no change
        }
        const slug = generateNameFromHeading(heading);
        return `${match} {#${slug}}`;
    });
};

const slugifyLessonSectionTitles = async () => {
    const lessonFilenames = getContentFilenames(contentPathRoot);

    for (const filename of lessonFilenames) {
        const content = fs.readFileSync(filename, 'utf8');
        const metadata = extractLessonMetadata(content);
        if (!metadata || metadata.type === 'facilitation-guide' || 'giants-guide') {
            continue;
        }
        // only need to stablise ids if "locked in" i.e. made accessible to students
        if (!metadata.publish || metadata.locked) {
            continue;
        }

        const newContent = setupSectionHeadingSlugs(content);
        if (newContent !== content) {
            fs.writeFileSync(filename, newContent);
        }
    }
};

slugifyLessonSectionTitles().catch((err) => {
    console.error(err);
    process.exit(1);
});
