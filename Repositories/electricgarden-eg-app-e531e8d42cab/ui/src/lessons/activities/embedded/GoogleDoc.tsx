import React from 'react';
import styled from 'styled-components/macro';
import { Button } from '../../../atomic-ui';
import { BlockContainer } from './shared';

type Props = {
    googleId: string;
    googlePdfId?: string;
    title?: string;
};

const CaptionContainer = styled.div`
    text-align: center;
`;

const FrameContainer = styled.div`
    text-align: center;

    iframe {
        width: 100%;
        height: 200px;
    }
`;

const generateDocsUrl = (googleId: string) =>
    `https://docs.google.com/document/d/e/${googleId}/pub?embedded=true`;

const generatePdfUrl = (googlePdfId: string) =>
    `https://docs.google.com/document/d/${googlePdfId}/preview`;

export const GoogleDocs: React.FC<Props> = ({
    googleId,
    title,
    googlePdfId,
}) => {
    const handleClick = () => {
        googlePdfId && window.open(generatePdfUrl(googlePdfId));
    };
    return (
        <BlockContainer>
            {title && (
                <CaptionContainer>
                    <h3>{title}</h3>
                </CaptionContainer>
            )}
            {googlePdfId && <Button onClick={handleClick}>View Document PDF</Button>}
            <FrameContainer>
                <iframe
                    src={generateDocsUrl(googleId)}
                    title={title}
                    frameBorder="3"
                />
            </FrameContainer>
        </BlockContainer>
    );
};
