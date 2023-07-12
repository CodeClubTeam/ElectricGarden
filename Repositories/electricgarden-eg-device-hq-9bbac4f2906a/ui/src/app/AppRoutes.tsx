import React from "react";
import { Route, Switch } from "react-router-dom";
import { DashboardPage } from "../dashboard";
import { DefaultsPage } from "../defaults";
import { DevicesPage } from "../devices";

export const AppRoutes = () => (
  <Switch>
    <Route exact path="/" component={DashboardPage} />
    <Route path="/devices" component={DevicesPage} />
    <Route path="/defaults" component={DefaultsPage} />
  </Switch>
);
