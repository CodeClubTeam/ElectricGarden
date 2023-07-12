import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';

import { cartItemsSelector } from './selectors';
import { CartItemTableRow } from './CartItemTableRow';
import { PageHeading } from '../../shared';

const Panel = styled.div`
  border: 1px solid #bdbdbd;
`;

const Table = styled.table`
  width: 100%;
  padding: 1em 2em 0 1em;

  /* squarespace reset */
  border-collapse: separate;
  border-spacing: 2px;
  /* end squarespace reset */

  tr {
    th,
    td {
      padding: 0.5em;
      font-weight: 300;
    }

    th:first-child,
    td:first-child {
      width: 30em;
      text-align: left;
    }

    th:nth-child(1n + 2),
    td:nth-child(1n + 2) {
      color: inherit;
      text-align: right;
    }

    th:nth-child(1n + 2) {
      text-transform: lowercase;
    }
    td:nth-child(1n + 2) {
      vertical-align: top;
    }
  }
`;

export const CartItemTable: React.FC = () => {
  const items = useSelector(cartItemsSelector);

  return (
    <Panel>
      <Table>
        <thead>
          <tr>
            <th scope="col">
              <PageHeading>My Subscriptions</PageHeading>
            </th>
            <th scope="col">Price</th>
            <th scope="col">Subscriptions</th>
            <th scope="col">Total Cost</th>
            {/* <th>Remove</th> */}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <CartItemTableRow item={item} key={item.type} />
          ))}
        </tbody>
      </Table>
    </Panel>
  );
};
