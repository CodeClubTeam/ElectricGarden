import React from "react";
import { FetchError, Loading } from "../../atomic-ui";
import { DeviceSettings } from "../../shared";
import { useFetchSettings, usePutSettings } from "../api";
import { SettingsJsonForm } from "../../atomic-ui";

type FormValues = {
  settings: string;
};

type Props = {
  serial: string;
};

export const DeviceSettingsEditor = ({ serial }: Props) => {
  const { isFetching, isError, data: settings, refetch } = useFetchSettings(
    serial,
  );
  const putSettings = usePutSettings(serial);

  if (isFetching) {
    return <Loading />;
  }

  if (isError || !settings) {
    return (
      <FetchError message="Error fetching settings" retry={() => refetch()} />
    );
  }

  const initialValues = {
    settings: JSON.stringify(settings, undefined, "  "),
  };

  const handleSubmit = async (values: FormValues) => {
    const settings = JSON.parse(values.settings) as DeviceSettings;
    return putSettings(settings);
  };

  return (
    <SettingsJsonForm onSubmit={handleSubmit} initialValues={initialValues} />
  );
};
