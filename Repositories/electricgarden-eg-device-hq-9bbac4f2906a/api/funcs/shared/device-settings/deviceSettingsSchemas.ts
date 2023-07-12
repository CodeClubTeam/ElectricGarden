import * as yup from "yup";
import { DeviceType } from "../records";
import {
  Catm1DeviceSettings,
  DeviceSettingsCommon,
  LoraDeviceSettings,
} from "./types";

const commonPartial = {
  Wakeup: yup.number().integer().min(0).max(1440),
  CountersFreq: yup.number().integer().min(0).max(0xffff),
  TransmitFreq: yup.number().integer().min(1).max(0xff),
  MaxRetries: yup.number().integer().min(0).max(0xff),
  MaxTransmits: yup.number().integer().min(0).max(0xff),
  TimeFreq: yup.number().integer().min(0).max(0xff),
  TimeSync: yup.number().integer().min(0).max(1440),
  TransmitSize: yup.number().integer().min(0).max(0xff),
  LocalMode: yup.number().integer().min(0).max(2),
  LocalFreq: yup.number().integer().min(0).max(0xff),
  LocalPeriod: yup.number().integer().min(0).max(0xff),
  AttachRetries: yup.number().integer().min(0).max(0xff), // currently just lora but might be catm1 in future
};

const makeAllRequired = (
  definition: Record<
    string,
    yup.NumberSchema | yup.StringSchema<string | undefined>
  >,
) =>
  Object.entries(definition).reduce((result, [name, sch]) => {
    result[name] = sch.required();
    return result;
  }, {} as yup.Shape<any, any>);

const commonSettingsPartialSchema = yup
  .object<Partial<DeviceSettingsCommon>>(commonPartial)
  .required();

const commonSettingsAllSchema = yup
  .object<DeviceSettingsCommon>(makeAllRequired(commonPartial))
  .required();

const catm1Partial = {
  SamplesEp: yup.string(),
  CallHomeEp: yup.string(),
  InstructionEp: yup.string(),
  ErrorEp: yup.string(),
  CountersEp: yup.string(),
  DetachMode: yup.number().integer().min(0).max(1),
};

const catm1SettingsSchema = yup
  .object<Partial<Omit<Catm1DeviceSettings, keyof DeviceSettingsCommon>>>(
    catm1Partial,
  )
  .concat(commonSettingsPartialSchema)
  .noUnknown(true)
  .strict(true)
  .required();

const catm1AllSettingsSchema = yup
  .object<Omit<Catm1DeviceSettings, keyof DeviceSettingsCommon>>(
    makeAllRequired(catm1Partial),
  )
  .concat(commonSettingsAllSchema)
  .noUnknown(true)
  .strict(true)
  .required();

const loraSettingsSchema = yup
  .object<Partial<LoraDeviceSettings>>()
  .concat(yup.object<Partial<DeviceSettingsCommon>>(commonPartial))
  .noUnknown(true)
  .strict(true)
  .required();

const loraAllSettingsSchema = yup
  .object<LoraDeviceSettings>()
  .concat(yup.object<DeviceSettingsCommon>(makeAllRequired(commonPartial)))
  .noUnknown(true)
  .strict(true)
  .required();

export const getSchemaForDeviceType = (type: DeviceType) =>
  type === "lora" ? loraSettingsSchema : catm1SettingsSchema;

export const getAllSchemaForDeviceType = (type: DeviceType) =>
  type === "lora" ? loraAllSettingsSchema : catm1AllSettingsSchema;
