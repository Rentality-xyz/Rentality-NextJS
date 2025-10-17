import { logger } from "./logger";

export const currencyFormat = (value: number | bigint) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export const getIntFromString = (text: string) => {
  return Number(text.replace(/[^\d.-]+/g, ""));
};

export const getUIntFromString = (text: string) => {
  return Number(text.replace(/[^\d.]+/g, ""));
};

export const formatEthWithDecimals = (value: bigint, decimals: bigint) => {
  return `${Number(value) / 10 ** Number(decimals)}`;
};

export const displayMoneyWith2Digits = (value: number | undefined, undefinedText?: string) => {
  if (value === undefined && undefinedText !== undefined) return undefinedText;
  if (value === undefined) return Number(0).toFixed(2);
  return value.toFixed(2);
};

export const displayMoneyWithNDigits = (value: number | undefined,digits: number, undefinedText?: string) => {
  if (value === undefined && undefinedText !== undefined) return undefinedText;
  if (value === undefined) return Number(0).toFixed(digits);
  return value.toFixed(digits);
};

export const displayMoneyWith2DigitsOrNa = (value: number | undefined) => {
  return displayMoneyWith2Digits(value, "N/A");
};

export const displayMoneyFromCentsWith2Digits = (value: number | bigint): string => {
  return (Number(value) / 100).toFixed(2);
};

export const fixedNumber = (value: number, decimals: number): number => {
  if (!value) return 0;

  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const decimalToHex = (decimalValue: string): string | null => {
  const decimalNumber = Number(decimalValue);

  if (!isNaN(decimalNumber)) {
    return decimalNumber.toString(16);
  } else {
    logger.error("Invalid input. Please provide a valid decimal number.");
    return null;
  }
};
