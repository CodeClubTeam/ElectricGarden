import styled from 'styled-components/macro';

export const PageHeader = styled.header`
    border-bottom: 3px solid ${({ theme }) => theme.active};

    h1 {
        text-transform: uppercase;
        padding: 20px 0 5px 1rem;
        max-width: var(--body-max-width);
        margin: 0 auto;
        color: ${({ theme }) => theme.active};
    }

    > svg {
        color: red;
    }
`;
