import { orderBy } from 'lodash-es';

import guides from '../content/facilitation-guides-index.json';
import { LessonMetadata } from '../definition';

export type FacilitationGuide = Omit<
    LessonMetadata,
    'guide' | 'badges' | 'type'
> & {
    contentPath: string;
};

export const facilitationGuides = orderBy(
    ((guides as unknown) as FacilitationGuide[]).filter(
        (guide) => !!guide.publish,
    ),
    ['ordinal', 'title'],
);

export const getFacilitationGuideByName = (name: string) =>
    facilitationGuides.find((guide) => guide.name === name);
