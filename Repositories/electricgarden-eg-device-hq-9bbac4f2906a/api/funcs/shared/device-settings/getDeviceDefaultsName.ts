import { DeviceType } from "../records";

export const getDeviceDefaultsName = (type: DeviceType) =>
  `DEFAULT_${type.toUpperCase()}`;
