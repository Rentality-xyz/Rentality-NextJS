export const TRANSMISSION_MANUAL_STRING = "Manual";
export const TRANSMISSION_AUTOMATIC_STRING = "Automatic";

export type TransmissionType = typeof TRANSMISSION_MANUAL_STRING | typeof TRANSMISSION_AUTOMATIC_STRING;

export const toTransmissionType = (value: string): TransmissionType =>
  value === TRANSMISSION_MANUAL_STRING ? TRANSMISSION_MANUAL_STRING : TRANSMISSION_AUTOMATIC_STRING;
