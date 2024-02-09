import moment from "moment";
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
  return BigInt(moment(time).utc().unix());
  //return BigInt(Math.floor(time.getTime() / 1000));
};

export const getDateFromBlockchainTime = (time: number | bigint): Date => {
  return moment.unix(Number(time)).local().toDate();
};
