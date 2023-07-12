import styled from 'styled-components/macro';

type Props = {
    borderColor?: string;
    radius?: string;
    border?: boolean;
};

export const ImageWithBorder = styled(({ borderColor, border, radius, ...props }: Props) => (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img {...props} />
))`
    border: ${({borderColor, border}) => border ? borderColor ? `solid 3px ${borderColor}` : `solid 3px #ec008c` : ''};
    border-radius: ${({radius}) => radius ? radius : '5px'};
`;
