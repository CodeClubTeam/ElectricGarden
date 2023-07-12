import { generateNameFromHeadingCreate } from '../helpers/sectionNames';

// TODO: assumption is heading level 2 but elsewhere we suggest it is configurable so make it so
const level2HeadingMatcher = (line: string) => line.startsWith('## ');

const extractSectionContent = (
    content: string,
    name: string,
    isSectionHeading: (line: string) => boolean,
) => {
    const lines = content.split('\n');
    const generateNameFromHeading = generateNameFromHeadingCreate();

    const headingIndex = lines.findIndex(
        (line) =>
            isSectionHeading(line) &&
            generateNameFromHeading(line.substring(2).trim()) === name,
    );
    const nextHeadingIndex =
        lines.slice(headingIndex + 1).findIndex(isSectionHeading) +
        headingIndex;

    const sectionContent = lines
        .slice(
            headingIndex,
            nextHeadingIndex >= headingIndex ? nextHeadingIndex : undefined,
        )
        .join('\n');

    return sectionContent;
};

export const useLessonSectionFetcher = (
    path: string,
    sectionName: string,
): string | undefined => {
    const content = ''; // useMarkdownFetcher(path);
    if (!content) {
        return undefined;
    }

    const sectionContent = extractSectionContent(
        content,
        sectionName,
        level2HeadingMatcher,
    );

    return sectionContent;
};
