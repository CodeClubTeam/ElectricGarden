export interface Sample {
  timestamp: Date;
  probeSoilTemp?: number;
  probeAirTemp?: number;
  probeMoisture?: number;
  ambientTemp?: number;
  ambientHumidity?: number;
  batteryVoltage?: number;
  rssi?: number;
  light?: number;
  snr?: number;
  errorCode?: number;
  co2?: number;
}
