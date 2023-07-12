import React from "react";
import {
  FetchError,
  Loading,
  SettingsJsonForm,
  SettingsJsonFormProps,
} from "../../atomic-ui";
import { DeviceSettings, DeviceType } from "../../shared";
import { useFetchDefaultSettings, usePutDefaultSettings } from "../api";

type Props = {
  type: DeviceType;
};

type FormValues = SettingsJsonFormProps["initialValues"];

export const DefaultDeviceSettingsEditor = ({ type }: Props) => {
  const {
    isFetching,
    isError,
    data: settings,
    refetch,
  } = useFetchDefaultSettings(type);
  const putDefaultSettings = usePutDefaultSettings(type);

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

  const handleSubmit = (values: FormValues) => {
    const settings = JSON.parse(values.settings) as DeviceSettings;
    return putDefaultSettings(settings);
  };

  return (
    <SettingsJsonForm onSubmit={handleSubmit} initialValues={initialValues} />
  );
};
