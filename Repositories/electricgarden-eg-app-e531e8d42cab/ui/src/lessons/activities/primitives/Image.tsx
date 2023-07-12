import React from 'react';
import styled from 'styled-components/macro';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
    tooltip?: string; // just a shorthand
    align?: string;
};

const Container = styled.div<Props>`
    text-align: ${({align}) => align ? align : 'center'};
`;

export const Image: React.FC<Props> = ({ tooltip, align, ...props }) => (
    <Container align={align}><img alt={tooltip} title={tooltip} {...props} /></Container>
);
