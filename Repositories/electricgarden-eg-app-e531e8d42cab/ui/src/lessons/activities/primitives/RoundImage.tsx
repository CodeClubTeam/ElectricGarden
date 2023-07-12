import { DetailedHTMLProps, ImgHTMLAttributes } from 'react';
import styled, { css } from 'styled-components/macro';

type Props = {
    borderSize?: number;
} & DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;

export const RoundImage = styled(({ borderSize, ...props }: Props) => (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img {...props} />
))`
    ${({ borderSize }) =>
        borderSize
            ? css`
                  border: solid ${borderSize}px #ec008c;
              `
            : css`
                  border: solid 4px #ec008c;
              `};
    border-radius: 50%;
    width: 150px;
    height: 150px;
    margin: 5px 20px;
`;
