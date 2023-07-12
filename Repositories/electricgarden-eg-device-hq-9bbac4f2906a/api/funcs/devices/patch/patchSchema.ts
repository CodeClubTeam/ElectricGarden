import * as yup from "yup";
import { DeviceInfo } from "../../shared";

export const patchSchema = yup
  .object<Pick<DeviceInfo, "appSamplesEndpointOverride">>({
    appSamplesEndpointOverride: yup.string().notRequired(),
  })
  .required();
