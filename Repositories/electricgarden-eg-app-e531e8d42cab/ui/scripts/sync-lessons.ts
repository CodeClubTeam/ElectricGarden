#!/usr/bin/env ts-node --files -P ./scripts/tsconfig.json -r dotenv/config
import path from 'path';

import {
    deleteLesson,
    getContentFilenames,
    getContentItemMetadatas,
    getLessons,
    upsertLesson,
} from './helpers';

// Trawls the lesson content markdown files extracting their metadata
// and syncs them up to the database (via the provision api)

const getFileSystemContentItems = () => {
    const contentPathRoot = path.resolve('./src/lessons/content');
    const contentFilenames = getContentFilenames(contentPathRoot);

    return getContentItemMetadatas(contentPathRoot, contentFilenames);
};

const sync = async () => {
    const lessons = getFileSystemContentItems().filter(
        (lesson) => lesson.type !== 'facilitation-guide' && lesson.type !== 'giants-guide',
    );

    for (const lesson of lessons) {
        console.info(`Creating/Updating lesson ${lesson.name}.`);
        await upsertLesson(lesson);
    }

    const filesystemLessonNames = lessons.map((lesson) => lesson.name);
    const databaseLessonNames = (await getLessons()).map(
        (lesson) => lesson.name,
    );

    const lessonNamesToRemove = databaseLessonNames.filter(
        (name) => !filesystemLessonNames.includes(name),
    );

    for (const name of lessonNamesToRemove) {
        console.info(`Removing lesson ${name}.`);
        await deleteLesson(name);
    }
};

sync()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
