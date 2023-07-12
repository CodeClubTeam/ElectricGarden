import React from 'react';
import styled from 'styled-components/macro';

// const Container = styled.p`
//   font-weight: bold;

//   margin: 0;
// `;

// const Dollars = styled.span`
//   display: inline-block;
// `;

// const Cents = styled.span`
//   display: inline-block;
//   font-size: 0.7em;
// `;

// hackery jack as in a rush
// export const Currency: React.FC<{ value: number } & React.HtmlHTMLAttributes<
//   HTMLParagraphElement
// >> = ({ value: price, ...rest }) => (
//   <Container {...rest}>
//     $<Dollars>{Math.round(price)}</Dollars>
//     <Cents>.{(price - Math.round(price)).toFixed(2).substring(2)}</Cents>
//   </Container>
// );

type Props = { value: number } & React.HtmlHTMLAttributes<HTMLSpanElement>;

export const Currency: React.FC<Props> = ({ value, ...rest }) => (
  <span {...rest}>${value.toFixed(2)}</span>
);

export const CurrencyLarge = styled(Currency)`
  font-size: 1.8rem;
  font-weight: bold;
`;
