import frontmatter from 'remark-frontmatter';
import parse from 'remark-parse';
import parseFrontmatter from 'remark-parse-yaml';
import remarkHtml from 'remark-html';
import unified from 'unified';

import { LessonMetadataRaw as LessonMetadata } from '../definition';
import { captureMetadata, captureSections } from './remark-plugins';

export const extractLessonMetadata = (
    content: string,
): LessonMetadata | undefined => {
    let metadata: LessonMetadata | undefined;
    const sections: LessonMetadata['sections'] = [];

    unified()
        .use(parse)
        .use(frontmatter, ['yaml'])
        .use(parseFrontmatter)
        .use(captureMetadata({ onCapture: (value) => (metadata = value) }))
        .use(
            captureSections({
                onSection: (name, title) => sections.push({ name, title }),
            }),
        )
        .use(remarkHtml) // output not used. is there a null processor?
        .processSync(content);

    if (!metadata) {
        throw new Error(`Metadata not found.`);
    }
    metadata.sections = sections;

    return metadata;
};
