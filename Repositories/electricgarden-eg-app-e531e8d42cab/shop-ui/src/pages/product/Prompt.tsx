import React from 'react';
import styled from 'styled-components/macro';
import { FREE_TRIAL_MODE } from '../../constants';

const Container = styled.div`
  max-width: 45em;
  margin: 2em auto;
  p {
    text-align: center;
  }
`;

const PromptHeader = styled.h2`
  color: #2ed03c;
  text-align: center;
`;

export const Prompt: React.FC = () =>
  FREE_TRIAL_MODE ? (
    <Container>
      <PromptHeader>
        Sign up to get your free Electric Garden trial
      </PromptHeader>
      <p>
        The Electric Garden supports digital learning, develops gardening
        knowledge, and promotes wellbeing with students spending time in nature.
      </p>
    </Container>
  ) : (
    <Container>
      <PromptHeader>Subscribe to Electric Garden</PromptHeader>
      <p>
        Subscribe now so your school or kura can start using the Electric
        Garden.
      </p>
      <p>
        A subscription to Electric Garden supports digital learning, develops
        gardening knowledge, and promotes wellbeing with students spending time
        in nature.
      </p>
    </Container>
  );
