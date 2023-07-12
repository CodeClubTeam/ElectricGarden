import React from 'react';
import styled from 'styled-components/macro';
import { BlockContainer } from './shared';

type Props = {
    googleId: string;
    googlePdfId?: string;
    title: string;
};

const CaptionContainer = styled.div`
    text-align: center;
`;

const FrameContainer = styled.div`
    margin: 0 auto;
    width: 700px;
    iframe {
        border: none;

        width: 100%;
        height: 420px;
    }
`;

const generateSlidesUrl = (googleId: string) =>
    `https://docs.google.com/presentation/d/e/${googleId}/embed?start=false&loop=false&delayms=3000`;

export const GoogleSlides: React.FC<Props> = ({ googleId, title }) => {
    return (
        <BlockContainer>
            <CaptionContainer>
                <h3>{title}</h3>
            </CaptionContainer>
            <FrameContainer>
                <iframe
                    src={generateSlidesUrl(googleId)}
                    title={title}
                    // @ts-ignore
                    allowfullscreen="true"
                    mozallowfullscreen="true"
                    webkitallowfullscreen="true"
                ></iframe>
            </FrameContainer>
        </BlockContainer>
    );
};
