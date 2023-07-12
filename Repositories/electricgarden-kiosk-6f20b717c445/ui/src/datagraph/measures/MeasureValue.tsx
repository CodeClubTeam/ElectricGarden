import React from "react";
import styled from "styled-components/macro";

import { Measure } from "../selectors";

type Props = Measure;

const Container = styled(({ metric, value, ...props }: Props) => (
  <div {...props} />
))`
  background-color: ${({ metric: { color } }) => color};
  --size: 90px;
  width: var(--size);
  height: var(--size);
  text-align: center;
  color: white;
  padding-top: 1.25em;
  padding-bottom: 0.5em;

  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const IconContainer = styled.div`
  opacity: 0.7;
`;

const ValueContainer = styled.div`
  font-weight: 400;
`;

const LabelContainer = styled.div`
  font-size: 1rem;
  text-transform: lowercase;
`;

export const MeasureValue: React.FC<Props> = (props) => {
  const { metric, value } = props;
  const { icon: IconSvg, suffix, label } = metric;
  const haveValue = value !== null;
  return (
    <Container {...props}>
      <IconContainer>{IconSvg && <IconSvg />}</IconContainer>
      <ValueContainer>
        {haveValue ? value : "no data"}
        {haveValue && suffix}
      </ValueContainer>
      <LabelContainer>{label}</LabelContainer>
    </Container>
  );
};
