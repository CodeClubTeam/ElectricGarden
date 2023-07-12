import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import styled from "styled-components/macro";
import { Device } from "./Device";
import { DeviceList } from "./DeviceList";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  --device-nav-width: 12em;
`;

const DeviceSelectionContainer = styled.div`
  padding: 1em;
  min-width: var(--device-nav-width);
`;

const DeviceDetailsContainer = styled.div`
  width: 100%;
`;

export const DevicesPage = () => {
  const { url } = useRouteMatch();

  return (
    <Container>
      <Switch>
        <Route path={`${url}/:serial`}>
          <DeviceSelectionContainer>
            <Route component={DeviceList} />
          </DeviceSelectionContainer>
          <DeviceDetailsContainer>
            <Route component={Device} />
          </DeviceDetailsContainer>
        </Route>
        <Route>
          <DeviceSelectionContainer>
            <Route component={DeviceList} />
          </DeviceSelectionContainer>
        </Route>
      </Switch>
    </Container>
  );
};
