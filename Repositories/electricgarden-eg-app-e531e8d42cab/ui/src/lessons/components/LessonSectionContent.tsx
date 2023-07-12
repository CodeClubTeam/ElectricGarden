import React, { lazy, Suspense } from 'react';

import { Loading } from '../../atomic-ui';
import { getMarkdownContent } from '../content/getMarkdownContent';
import { MDXProvider, MDXProviderProps } from '@mdx-js/react';

export const LessonSectionContent: React.FC<{
    contentPath: string;
    sectionName: string;
}> = ({ contentPath, sectionName }) => {
    const components: MDXProviderProps['components'] = {
        wrapper: ({ children, ...props }) => {
            if (Array.isArray(children)) {
                const sections = children.filter(
                    (child) => (child! as any).props.mdxType === 'section',
                );
                if (sections.length > 0) {
                    const matchingSection = sections.find((node) => {
                        const sectionChildren = (node as any).props.children;
                        return !!React.Children.toArray(sectionChildren).find(
                            (child: any) => {
                                const childProps = child.props;
                                return (
                                    childProps &&
                                    childProps.mdxType === 'h2' &&
                                    childProps.id === sectionName
                                );
                            },
                        );
                    });
                    if (matchingSection) {
                        return <>{matchingSection}</>;
                    }
                }
            }
            return <p>Section not found.</p>;
        },
    };

    const Document = lazy(async () => {
        const mdxModule = await getMarkdownContent(contentPath);
        if (!mdxModule) {
            return <p>Project not found.</p>;
        }
        return mdxModule;
    });

    return (
        <div>
            <Suspense fallback={<Loading message="Loading project content" />}>
                <MDXProvider components={components}>
                    <Document />
                </MDXProvider>
            </Suspense>
        </div>
    );
};
