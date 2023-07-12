import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
    FontAwesomeIcon,
    FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components/macro';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    submitting?: boolean;
    size?: FontAwesomeIconProps['size'];
};

const LooklessButton = styled(({ submitting, size, ...props }: Props) => (
    <button {...props} />
))`
    border: none;
    padding: 0;
    background: none;
`;

export const IconButton: React.FC<Props> = ({
    submitting,
    disabled,
    children,
    size,
    ...props
}) => (
    <LooklessButton disabled={disabled || submitting} {...props}>
        {submitting && <FontAwesomeIcon icon={faSpinner} spin size={size} />}
        {!submitting && children}
    </LooklessButton>
);
