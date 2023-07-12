import React from 'react';
import styled from 'styled-components/macro';
import { useSelector } from 'react-redux';
import { cartTotalsSelector } from './selectors';
import { Currency } from '../../shared';

const Table = styled.table`
  margin: 1em 3em 0 auto;
`;

const LabelColumn = styled.th`
  padding-right: 1em;
  font-weight: normal;
  text-align: right;
`;

const ValueColumn = styled.td`
  text-align: right;
`;

type RowProps = {
  className?: string;
  label: string;
  value: number;
};

const Row: React.FC<RowProps> = ({ label, value, ...props }) => (
  <tr {...props}>
    <LabelColumn>{label}:</LabelColumn>
    <ValueColumn>
      <Currency value={value} />
    </ValueColumn>
  </tr>
);

const TotalRow = styled(Row)`
  text-transform: uppercase;
  font-size: 1.5rem;
  line-height: 200%;
`;

export const CartTotals: React.FC = () => {
  const { subtotal, total, gst } = useSelector(cartTotalsSelector);
  return (
    <Table>
      <tbody>
        <Row label="Subtotal" value={subtotal} />
        <Row label="GST" value={gst} />
        <TotalRow label="Total" value={total} />
      </tbody>
    </Table>
  );
};
