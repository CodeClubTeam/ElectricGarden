import { QueryClient, QueryClientProvider } from 'react-query';
import styled from 'styled-components/macro';

import { Startup } from './startup/Startup';

export const Container = styled.div`
  background-color: ${({ theme }) => theme.cover.bg};
`;

const queryClient = new QueryClient();

export const App = () => {
  return (
    <Container>
      <QueryClientProvider client={queryClient}>
        <Startup />
      </QueryClientProvider>
    </Container>
  );
};
