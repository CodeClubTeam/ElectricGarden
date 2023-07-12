import * as CSS from 'csstype';
import React from 'react';
import styled from 'styled-components/macro';

const Container = styled(
    ({
        selected,
        selectedColor,
        ...props
    }: Pick<ColoredCheckboxProps, 'selected' | 'selectedColor'>) => (
        <div {...props} />
    ),
)`
    margin: 1em;

    label {
        font-size: 18px;
        font-weight: bold;
        color: ${({ selected, selectedColor }: ColoredCheckboxProps) =>
            selected ? selectedColor : ''};
    }
`;

export type ColoredCheckboxProps = {
    name?: string;
    selectedColor: Required<CSS.Properties>['color'];
    selected?: boolean;
    onChange?: (selected?: boolean) => void;
};

export const ColoredCheckbox: React.FC<ColoredCheckboxProps> = ({
    name,
    children,
    selectedColor,
    selected,
    onChange,
}) => {
    const handleOnChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (onChange) {
                onChange(e.target.checked);
            }
        },
        [onChange],
    );

    return (
        <Container {...{ selected, selectedColor }}>
            <label>
                <input
                    type="checkbox"
                    name={name}
                    onChange={handleOnChange}
                    checked={selected}
                />{' '}
                {children}
            </label>
        </Container>
    );
};
