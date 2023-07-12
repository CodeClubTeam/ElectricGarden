import React from "react";
import { useRouteMatch, Switch, Route, Redirect } from "react-router-dom";
import { DeviceTypeDefaults } from "./DeviceTypeDefaults";

export const DefaultsPage = () => {
  const { url } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={`${url}/`}>
        <Redirect to={`${url}/lora`} />
      </Route>
      <Route path={`${url}/:type`} component={DeviceTypeDefaults} />
    </Switch>
  );
};
