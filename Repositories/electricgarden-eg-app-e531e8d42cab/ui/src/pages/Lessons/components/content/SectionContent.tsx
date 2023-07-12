import React from 'react';
import styled from 'styled-components/macro';
import './SectionContent.css';

import { LessonSectionContent } from '../../../../lessons';

const Container = styled.div`
    font-family: 'Nunito', sans-serif;

    h2 {
        font-weight: 700;
        color: ${({ theme }) => theme.active};
        font-size: 30px;
    }

    h4 {
        font-size: 24px;
    }

    font-weight: 300;
    font-size: 14px;

    section {
        > img {
            max-width: 100%;
            padding: 15px;
            margin: 0 auto;
            display: block;
        }
    }

    section > section > *,
    section > section > section > * {
        /* space between sections */
        margin-bottom: 0.5em;
    }

    section > section > h3{margin-top: 8px}
    section > section > h4{margin-top: 8px}
    h5,
    section > section > section > h3,
    h4,
    h5 {
        /* space between headings */
        margin-top: 1em;
    }

    div > section > section {
        color: ${({ theme }) => theme.section.fg};
        border-radius: 5px;
        border: 2px solid ${({ theme }) => theme.active};
        padding: 24px 32px; // padding inside green border
        margin-bottom: 24px; // space between bordered blocks
    }
`;

export const SectionContent: React.FC<{
    contentPath: string;
    sectionName: string;
}> = ({ contentPath, sectionName }) => {
    return (
        <Container>
            <LessonSectionContent
                contentPath={contentPath}
                sectionName={sectionName}
            />
        </Container>
    );
};
