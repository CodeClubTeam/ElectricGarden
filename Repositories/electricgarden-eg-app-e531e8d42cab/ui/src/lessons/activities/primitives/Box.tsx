import styled from 'styled-components/macro';

type Props = {
    width: number;
    height: number;
    subtitle?: boolean;
};

export const Box = styled.div<Props>`
    width: ${({ width }) => `${width}px`};
    height: ${({ height }) => `${height}px`};
    display: flex;
    justify-content: center;
    align-items: ${({ subtitle }) => (subtitle ? 'baseline' : 'center')};
`;
