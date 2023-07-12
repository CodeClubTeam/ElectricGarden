import styled from 'styled-components/macro';

export const MatchRemove = styled.div`
    cursor: pointer;
    &:hover {
        * {
            --mxatch-color: ${({ theme }) => theme.btn.danger.bg};
            opacity: 0.5;
        }
    }
`;
