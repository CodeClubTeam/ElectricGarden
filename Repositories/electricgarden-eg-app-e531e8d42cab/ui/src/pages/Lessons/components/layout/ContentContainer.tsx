import styled from 'styled-components/macro';

export const ContentContainer = styled.div`
    background: ${({ theme }) => theme.bg};
    color: ${({ theme }) => theme.fg};
    max-width: var(--body-max-width);
    margin: 0 auto;
`;
