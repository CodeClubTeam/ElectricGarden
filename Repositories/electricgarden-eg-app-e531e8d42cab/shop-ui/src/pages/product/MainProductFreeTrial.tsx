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

export const MainProductFreeTrial: React.FC<Props> = ({
  price,
  quantity,
  onQuantityChanged,
}) => (
  <Container>
    <ImageContainer>
      <img src={imageFullUrl} alt="In the box" />
    </ImageContainer>
    <ContentContainer>
      <h2>Free Trial</h2>
      <p></p>
      <p>A one month free trial gives your school:</p>
      <ul>
        <li>
          An easy-to-use sensor kit to measure and wirelessly record
          environmental data
        </li>
        <li>
          Access for staff and students to unique online learning resources
        </li>
        <li>Support from the Electric Garden team</li>
      </ul>
      <p>
        Your trial will allow you to use the sensor and online resources for
        four school weeks giving you and your students a chance to engage with
        all aspects of the online learning platform.{' '}
      </p>
      <p>
        Once your trial has completed, if you choose to discontinue we will
        arrange for shipping back to us at no charge. If you choose to purchase
        we charge just $35 per month.
      </p>
      <p>How many units would you like? We recommend one per class.</p>
      <p>
        <QuantityInput value={quantity} onChange={onQuantityChanged} />
      </p>
      <p>
        <CurrencyLarge value={price} /> / month
      </p>
    </ContentContainer>
  </Container>
);
