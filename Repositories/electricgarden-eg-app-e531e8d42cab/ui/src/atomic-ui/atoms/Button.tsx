import React from 'react';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export type ButtonProps = {
    onClick?: () => void;
    disabled?: boolean;
    secondary?: boolean;
    danger?: boolean;
    size?: '1x' | '2x';
    left?: boolean;
    active?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = styled(
    ({ secondary, danger, ...btnProps }: ButtonProps) => (
        <button {...btnProps} />
    ),
)`
    border: none;
    font-size: ${({ size }) =>
        size ? (size === '1x' ? '10px' : '20px') : '20px'};
    line-height: ${({ size }) =>
        size ? (size === '1x' ? '12px' : '22px') : '22px'};
    padding: 0.5em;
    text-transform: lowercase;

    background: ${({ theme, secondary, danger, disabled }) =>
        disabled
            ? theme.btn.disabled.bg
            : secondary
            ? theme.btn.secondary.bg
            : danger
            ? theme.btn.danger.bg
            : theme.btn.primary.bg};
    border-radius: ${({ theme }) => theme.btn.borderRadius};
    color: ${({ theme, secondary, danger, disabled }) =>
        disabled
            ? theme.btn.disabled.fg
            : secondary
            ? theme.btn.secondary.fg
            : danger
            ? theme.btn.danger.fg
            : theme.btn.primary.fg};

    :hover {
        opacity: 0.5;
    }
`;

export const TinyButton = styled((props) => <span {...props} role="button" />)`
    cursor: pointer;
    display: inline-block;

    :hover {
        opacity: 0.5;
    }
    vertical-align: top;
`;

type ActionButtonProps = ButtonProps & {
    busy?: boolean;
};

export const ActionButton = ({
    busy,
    children,
    ...props
}: ActionButtonProps) => (
    <Button disabled={busy} {...props}>
        {busy && <FontAwesomeIcon icon={faSpinner} spin />} {children}
    </Button>
);

// for buttons with an svg we color the content instead of the background
// and we need to reset a few properties
export const SvgButton = styled(Button)`
    padding: 0;
    font-size: initial;
    background: none;
    border-radius: 0;
    color: ${({ theme, secondary, danger, disabled }) =>
        disabled
            ? theme.btn.disabled.bg
            : secondary
            ? theme.btn.secondary.bg
            : danger
            ? theme.btn.danger.bg
            : theme.btn.primary.bg}; ;
`;
