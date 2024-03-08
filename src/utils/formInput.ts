import moment from "moment-timezone";
import { getUIntFromString } from "./numericFormatters";

export const getMoneyInCentsFromString = (str: string | undefined): number => {
  if (!str) return 0;

  const valueDouble = getUIntFromString(str);
  return (valueDouble * 100) | 0;
};

export const getStringFromMoneyInCents = (value: number | bigint): string => {
  return (Number(value) / 100).toString();
};

export const getBlockchainTimeFromDate = (time: Date): bigint => {
  return BigInt(moment.utc(time).unix());
  //return BigInt(Math.floor(time.getTime() / 1000));
};

export const getDateFromBlockchainTime = (time: number | bigint): Date => {
  return moment.unix(Number(time)).local().toDate();
};

export const getDateFromBlockchainTimeWithTZ = (time: number | bigint, timeZoneId: string): Date => {
  return moment.unix(Number(time)).tz(timeZoneId).toDate();
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
};
