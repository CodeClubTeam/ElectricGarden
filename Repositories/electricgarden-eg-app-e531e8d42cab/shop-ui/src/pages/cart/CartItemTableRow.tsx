import React from 'react';

import { Currency } from '../../shared';
import { PricedCartItem } from '../../types';
import { ElectricGarden } from './products/ElectricGarden';

type Props = {
  item: PricedCartItem;
};

export const CartItemTableRow: React.FC<Props> = ({ item }) => (
  <tr>
    <td>{item.type === 'eg' && <ElectricGarden />}</td>
    <td>
      <Currency value={item.price} />
    </td>
    <td>{item.quantity}</td>
    <td>
      <Currency value={item.price * item.quantity} />
    </td>
    {/* <td>
      <p>remove</p>
    </td> */}
  </tr>
);
