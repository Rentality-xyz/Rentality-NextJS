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
