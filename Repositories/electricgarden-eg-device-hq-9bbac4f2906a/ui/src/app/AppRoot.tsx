import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { AppRoutes } from "./AppRoutes";
import { ReactQueryConfigProvider } from "react-query";
import { ReactQueryDevtools } from "react-query-devtools";

export const AppRoot = () => (
  <BrowserRouter>
    <ReactQueryConfigProvider
      config={{ queries: { staleTime: 5000, refetchOnWindowFocus: false } }}
    >
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </ReactQueryConfigProvider>
    {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
  </BrowserRouter>
);
