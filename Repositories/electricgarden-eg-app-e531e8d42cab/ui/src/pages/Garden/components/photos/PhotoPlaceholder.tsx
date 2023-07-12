import React from 'react';
import styled from 'styled-components/macro';

const Placeholder = styled.div`
    height: calc(var(--photo-container-width) * 3 / 4);
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: ${({ theme }) => theme.greys.mid};

    p {
        margin: 0 auto;
        text-align: center;
        padding: 0 4em;
    }
`;

export const PhotoPlaceholder: React.FC<{ readOnly?: boolean }> = ({
    readOnly,
}) => (
    <Placeholder>
        {readOnly ? (
            <p>Uploaded photos go here.</p>
        ) : (
            <p>Drag and drop or click the camera icon above to add a photo.</p>
        )}
    </Placeholder>
);
