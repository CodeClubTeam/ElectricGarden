import styled from 'styled-components/macro';

export const BorderedContainer = styled.div`
    color: ${({ theme }) => theme.section.fg};

    border-radius: 8px;
    padding: 5px;
    border: 2px solid ${({ theme }) => theme.active};

    img {
        max-width: 100%;
        margin: 0 auto;
    }
`;
