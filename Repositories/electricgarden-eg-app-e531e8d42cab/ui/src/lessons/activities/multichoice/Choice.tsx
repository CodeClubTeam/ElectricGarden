import React, { useCallback } from 'react';
import styled, { css } from 'styled-components/macro';

// hide the input because it's for a11ty mainly
const Input = styled.input`
    position: absolute;
    clip: rect(0, 0, 0, 0);
    height: 1px;
    width: 1px;
    border: none;

    /* selector below assumes input then label  */
    :checked + label {
        background: var(--container-color);
        color: #888888;
    }
`;

const hoverCss = css`
    :hover {
        cursor: pointer;
        background: #a7a7a7;
        color: white;
    }
`;

const selectedCss = css`
    color: ${({ theme }) => `color: ${theme.active}`};
`;

// this is where the display goes, here and the child selector above
const Label = styled(
    ({
        disabled,
        selected,
        ...props
    }: React.LabelHTMLAttributes<HTMLLabelElement> & {
        disabled?: boolean;
        selected?: boolean;
    }) => <label {...props} />,
)`
    transition: all 0.1s ease-in-out;
    padding: 0;
    margin: 0;
    border-radius: var(--border-radius);
    ${({ disabled }) => !disabled && hoverCss}

    background: var(--background-color);
    color: black;
    width: 100%;
    min-height: 100%; /* Sets each choice to have the height of the biggest box */
    ${({ selected }) => selected && selectedCss}
`;

type Props = {
    group: string;
    name: string;
    selected?: boolean;
    onToggle?: () => void;
    disabled?: boolean;
};

export const Choice: React.FC<Props> = ({
    group,
    name,
    selected,
    onToggle,
    disabled,
    children,
}) => {
    const id = `${group}-${name}`;

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (onToggle) {
                onToggle();
            }
        },
        [onToggle],
    );

    return (
        <>
            <Input
                id={id}
                name={name}
                type="checkbox"
                checked={selected}
                onChange={handleChange}
                disabled={disabled}
            />
            <Label htmlFor={id} disabled={disabled} selected={selected}>
                {children}
            </Label>
        </>
    );
};
