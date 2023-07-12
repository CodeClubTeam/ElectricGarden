import React, { useCallback } from 'react';
import styled from 'styled-components/macro';

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  value?: number;
  onChange?: (value: number) => void;
};

const StyledInput = styled.input`
  max-width: 4em;
`;

export const NumberInput: React.FC<Props> = ({ value, onChange, ...rest }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange],
  );

  return (
    <StyledInput
      {...rest}
      value={value}
      type="number"
      onChange={handleChange}
      min={1}
      max={100}
    />
  );
};
