import styled from 'styled-components/macro';

type Props = {
    align?: string;
};

export const Figure = styled.div<Props>`
    display: flex;
    justify-content: ${({align}) => align ? align : 'center'};
`;
