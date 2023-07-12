import React, { useCallback } from 'react';
import styled from 'styled-components/macro';

import { DateRangePreset } from './dateRangePresets';

// largely stolen from https://thestizmedia.com/radio-buttons-as-toggle-buttons-with-css/

// hide the input because it's for a11ty mainly
const Input = styled.input`
    position: absolute;
    clip: rect(0, 0, 0, 0);
    height: 1px;
    width: 1px;
    border: 0;

    /* selector below assumes input then label  */
    :checked + label {
        background-color: #2ed03c;
        border-left: 2px solid rgba(0, 0, 0, 0.2);
        border-right: 2px solid rgba(0, 0, 0, 0.2);
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
        color: white;
        font-weight: 400;
    }
`;

// this is where the display goes, here and the child selector above
const Label = styled.label`
    background-color: #2ed03c;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 300;
    text-align: center;
    padding: 8px 16px;
    margin-right: -1px;

    transition: all 0.1s ease-in-out;
    --border-radius: 25px;

    :hover {
        cursor: pointer;
    }

    :first-of-type {
        border-radius: var(--border-radius) 0 0 var(--border-radius);
    }

    :last-of-type {
        border-radius: 0 var(--border-radius) var(--border-radius) 0;
    }
`;

type Props = {
    group: string;
    preset: DateRangePreset;
    selected?: boolean;
    onSelect?: () => void;
};

export const DateRangeToggleButton: React.FC<Props> = ({
    group,
    preset: { title, name },
    selected,
    onSelect,
}) => {
    const id = `${group}-${name}`;

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.value === name && onSelect) {
                onSelect();
            }
        },
        [name, onSelect],
    );
    return (
        <>
            <Input
                id={id}
                name={group}
                value={name}
                type="radio"
                checked={selected}
                onChange={handleChange}
            />
            <Label htmlFor={id}>{title}</Label>
        </>
    );
};
