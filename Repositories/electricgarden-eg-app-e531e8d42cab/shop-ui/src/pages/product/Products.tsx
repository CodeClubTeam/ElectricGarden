import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';

import { cartItemsSelector } from '../../pages/cart';
import { AppDispatch, ProductType } from '../../types';
import { MainProduct } from './MainProduct';
import { MainProductFreeTrial } from './MainProductFreeTrial';

const Panel = styled.div``;

export const Products: React.FC = () => {
  const items = useSelector(cartItemsSelector);
  const dispatch = useDispatch<AppDispatch>();
  const handleQuantityChanged = useCallback(
    (type: ProductType, quantity: number) => {
      dispatch({
        type: 'SET_SHOPPING_CART_QUANTITY',
        payload: { type, quantity },
      });
    },
    [dispatch],
  );

  return (
    <Panel>
      {items.map((item) => (
        <div key={item.type}>
          {item.type === 'eg' && (
            <MainProduct
              price={item.price}
              quantity={item.quantity}
              onQuantityChanged={(quantity: number) =>
                handleQuantityChanged(item.type, quantity)
              }
            />
          )}
          {item.type === 'egft' && (
            <MainProductFreeTrial
              price={item.price}
              quantity={item.quantity}
              onQuantityChanged={(quantity: number) =>
                handleQuantityChanged(item.type, quantity)
              }
            />
          )}
        </div>
      ))}
    </Panel>
  );
};
