import React from "react";
import styled from "styled-components/macro";
import Select, { ValueType } from "react-select";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 5px 0;
`;

type Props = {
  serial: string | null | undefined;
  onSerialChange: (serial: string | null | undefined) => void;
  serials: string[];
};

type Option = { label: string; value: string };

const mapOption = (serial: string): Option => ({
  label: serial,
  value: serial,
});

export const DeviceSerialFilter = ({
  serial,
  onSerialChange,
  serials,
}: Props) => {
  const options = serials.map(mapOption);

  const handleChange = (option: ValueType<Option>) => {
    if (!option || Array.isArray(option)) {
      onSerialChange(undefined);
    } else {
      onSerialChange((option as Option).value);
    }
  };

  return (
    <Container>
      <Select<Option>
        options={options}
        value={serial ? mapOption(serial) : undefined}
        onChange={handleChange}
        placeholder="Serial"
        isClearable
        escapeClearsValue
      />
    </Container>
  );
};
