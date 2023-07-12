import React, { useCallback } from "react";
import styled from "styled-components/macro";
import { MetricType } from "../../shared";

// hide the input because it's for a11ty mainly
const Input = styled.input`
  position: absolute;
  clip: rect(0, 0, 0, 0);
  height: 1px;
  width: 1px;
  border: none;

  /* selector below assumes input then label  */
  :checked + label {
    box-shadow: none;
  }
`;

// this is where the display goes, here and the child selector above
const Label = styled.label`
  transition: all 0.1s ease-in-out;
  padding: 0;
  margin: 0;
  border-radius: var(--border-radius);
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.7); /* look "popped" so removing looks "pressed" */
  :hover {
    cursor: pointer;
  }
`;

type Props = {
  type: MetricType;
  selected?: boolean;
  onToggle?: () => void;
};

export const MetricToggleButton: React.FC<Props> = ({
  type,
  selected,
  onToggle,
  children,
}) => {
  const name = type;
  const group = "measure-toggle";
  const id = `${group}-${type}`;

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
      />
      <Label htmlFor={id}>{children}</Label>
    </>
  );
};
