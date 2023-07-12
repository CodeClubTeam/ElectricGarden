import React, { lazy, Suspense } from 'react';

import { Loading } from '../../atomic-ui';
import { getMarkdownContent } from '../content/getMarkdownContent';

export const FacilitationContent: React.FC<{
    contentPath: string;
}> = ({ contentPath }) => {
    const Document = lazy(async () => {
        const mdxModule = await getMarkdownContent(contentPath);
        if (!mdxModule) {
            return <p>Content not found.</p>;
        }
        return mdxModule;
    });

    return (
        <div>
            <Suspense fallback={<Loading message="Loading" />}>
                <Document />
            </Suspense>
        </div>
    );
};
