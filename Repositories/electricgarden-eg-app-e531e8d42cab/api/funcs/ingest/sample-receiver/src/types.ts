export interface Sample {
  timestamp: Date;
  probeSoilTemp?: number;
  probeAirTemp?: number;
  probeMoisture?: number;
  ambientTemp?: number;
  ambientHumidity?: number;
  co2?: number;
  light?: number;
  batteryVoltage?: number;
  rssi?: number;
  snr?: number;
  errorCode?: number;
}
