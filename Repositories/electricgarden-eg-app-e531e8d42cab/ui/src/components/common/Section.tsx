import React from 'react';
import styled from 'styled-components/macro';

type Props = {
    header?: React.ReactChild;
    subheader?: React.ReactChild;
};

const Container = styled.section`
    margin: 20px;

    .section-header {
        font-size: 21px;
        font-weight: bold;
        color: #231f20;
        margin: 10px 0;
    }
    .section-body {
        background: ${({ theme }) => theme.section.bg};
        border-radius: 8px;
        padding: 20px;
        border: 2px solid ${({ theme }) => theme.active};
        color: ${({ theme }) => theme.section.fg};

        a {
            color: ${({ theme }) => theme.active};
        }
    }
    /* .tags-area {
        width: 100%;
        border-radius: 4px;
    } */
`;

export const Section: React.FC<Props> = ({ header, subheader, children }) => (
    <Container>
        {header && <div className="section-header">{header}</div>}
        {subheader && <div>{subheader}</div>}
        <div className="section-body">{children}</div>
    </Container>
);

export default Section;
