import { orderBy } from 'lodash-es';

import guides from '../content/giants-guides-index.json';
import { LessonMetadata } from '../definition';

export type GiantsGuide = Omit<LessonMetadata, 'guide' | 'badges' | 'type'> & {
    contentPath: string;
};

export const giantsGuides = orderBy(
    (guides as unknown as GiantsGuide[]).filter((guide) => !!guide.publish),
    ['ordinal', 'title'],
);

export const getGiantsGuideByName = (name: string) =>
    giantsGuides.find((guide) => guide.name === name);
