import React from 'react';

import { PageContent, PageFooter } from '../../../atomic-ui';
import { FacilitationGuideList } from './contents/FacilitationGuideList';
import { ContentsContentContainer, LessonsPageHeader } from './layout';

export const LeaderResourcesHome: React.FC = () => {
    return (
        <>
            <LessonsPageHeader>
                <h1>Teaching Resources</h1>
            </LessonsPageHeader>
            <PageContent>
                <ContentsContentContainer>
                    <FacilitationGuideList />
                </ContentsContentContainer>
            </PageContent>
            <PageFooter />
        </>
    );
};
