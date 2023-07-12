import React from 'react';
import { Link, LinkProps, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components/macro';

const StyledLink = styled(({ disabled, ...props }) => <Link {...props} />)`
    color: ${({ theme, disabled }) =>
        disabled ? theme.inactive : theme.active};
    ${({ disabled }) => (disabled ? 'cursor: unset' : '')};
    :visited {
        color: ${({ theme, disabled }) =>
            disabled ? theme.inactive : theme.active};
    }
`;

export type LinkButtonProps = LinkProps & {
    disabled?: boolean;
};

export const LinkButton: React.FC<LinkButtonProps> = (props) => {
    const { url: selfUrl } = useRouteMatch();
    return props.disabled ? (
        <StyledLink {...props} to={selfUrl} />
    ) : (
        <StyledLink {...props} />
    );
};
