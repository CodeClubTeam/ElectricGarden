import React from "react";

import {
  FetchError,
  Loading,
  SettingsJsonForm,
  SettingsJsonFormProps,
} from "../../atomic-ui";
import {} from "../../instructions";
import { SampleRelaySettings } from "../../shared";
import { useFetchSampleRelaySettings, usePutSampleRelaySettings } from "../api";

type Props = {
  serial?: string;
};

type FormValues = SettingsJsonFormProps["initialValues"];

export const SampleRelaySettingsEditor = ({ serial }: Props) => {
  const {
    isFetching,
    isError,
    data: settings,
    refetch,
  } = useFetchSampleRelaySettings(serial);
  const putSettings = usePutSampleRelaySettings(serial);

  if (isFetching) {
    return <Loading />;
  }

  if (isError || !settings) {
    return (
      <FetchError
        message="Error fetching sample relay settings"
        retry={() => refetch()}
      />
    );
  }

  const initialValues = {
    settings: JSON.stringify(settings, undefined, "  "),
  };

  const handleSubmit = (values: FormValues) => {
    const settings = JSON.parse(values.settings) as SampleRelaySettings;
    return putSettings(settings);
  };

  return (
    <SettingsJsonForm onSubmit={handleSubmit} initialValues={initialValues} />
  );
};
