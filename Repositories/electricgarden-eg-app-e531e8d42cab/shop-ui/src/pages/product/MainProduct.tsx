import React from 'react';
import styled from 'styled-components/macro';

import { getAssetFullUrl } from '../../api';
import { CurrencyLarge, NumberInput } from '../../shared';
import imageUrl from './eg-in-garden.jpg';

const imageFullUrl = getAssetFullUrl(imageUrl);

const Container = styled.div`
  display: flex;
`;

const ImageContainer = styled.div`
  margin: 1em;
  img {
    border-radius: 4px;
  }
`;

const ContentContainer = styled.div`
  margin: 0 1em;

  h2 {
    font-size: 1.8rem;
    color: #2ed03c;
    margin: 0.5em 0;
  }

  ol {
    margin: 0;
  }

  p {
    margin: 0.5em 0;
  }
`;

const QuantityInput = styled(NumberInput)`
  font-size: 1.25rem;
`;

type Props = {
  price: number;
  quantity: number;
  onQuantityChanged: (quantity: number) => void;
};

export const MainProduct: React.FC<Props> = ({
  price,
  quantity,
  onQuantityChanged,
}) => (
  <Container>
    <ImageContainer>
      <img src={imageFullUrl} alt="In the box" />
    </ImageContainer>
    <ContentContainer>
      <h2>Subscribe</h2>
      <p></p>
      <p>An annual subscription gives your school:</p>
      <ul>
        <li>An easy-to-use sensor kit to measure and wirelessly record data</li>
        <li>Access for staff and students to unique online resources</li>
        <li>Support from the Electric Garden team</li>
      </ul>
      <p>How many subscriptions would you like? We recommend one per class.</p>
      <p>
        <QuantityInput value={quantity} onChange={onQuantityChanged} />
      </p>
      <p>
        <CurrencyLarge value={price} />
      </p>
    </ContentContainer>
  </Container>
);
