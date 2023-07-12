import React from 'react';
import styled from 'styled-components/macro';

import icon from './eg.png';

const Container = styled.div`
  margin: 0 0 0 1em;
  :before {
    content: url(${icon}); /* note because it's a small image it gets inlined */
    margin-left: -24px; /* magic number hack based on image size to get rid of extra space */
  }

  p:first-child {
    margin-top: -77px; /* image size based */
  }
  p {
    margin-left: 80px; /* image size based */
    margin-top: 0.25em;
  }
`;

const TitlePara = styled.p`
  color: #2ed03c;
  vertical-align: top;
  margin: 0;
`;

const DescriptionPara = styled.p`
  font-size: 0.9rem;
`;

export const ElectricGarden: React.FC = () => (
  <Container>
    <TitlePara>12 month Electric Garden subscription</TitlePara>
    <DescriptionPara>
      Includes wireless kit, online resources and support.
    </DescriptionPara>
  </Container>
);
