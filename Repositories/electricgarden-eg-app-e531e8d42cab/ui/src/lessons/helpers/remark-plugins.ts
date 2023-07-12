import { Plugin } from 'unified';
import { Node } from 'unist';
import visit from 'unist-util-visit';

import { LessonMetadata } from '../definition';
import { generateNameFromHeadingCreate } from './sectionNames';

type CaptureMetadataOptions = {
    onCapture: (metadata: LessonMetadata) => void;
};

export const captureMetadata = ({
    onCapture,
}: CaptureMetadataOptions): Plugin => () => (tree) => {
    visit(tree, 'yaml', (node: any) => {
        // parsedValue is populated by parseFrontMatter
        onCapture(node.data.parsedValue);
    });
    return tree;
};

const DEFAULT_SECTION_HEADING_LEVEL = 2;

type CaptureSectionsOptions = {
    onSection: (name: string, title: string) => void;
    sectionHeadingLevel?: number;
};

const HEADING_ID_REGEX = / \{#.*\}/;

export const captureSections = ({
    onSection,
    sectionHeadingLevel,
}: CaptureSectionsOptions): Plugin => () => (tree) => {
    const generateNameFromHeading = generateNameFromHeadingCreate();
    visit(tree, 'heading', (node: Node) => {
        const { depth } = node;
        if (depth === (sectionHeadingLevel || DEFAULT_SECTION_HEADING_LEVEL)) {
            visit(node, 'text', ({ value }: Node) => {
                const heading = value as string;
                const name = generateNameFromHeading(heading);
                const title = heading.replace(HEADING_ID_REGEX, '');
                onSection(name, title);
            });
        }
    });
    return tree;
};
