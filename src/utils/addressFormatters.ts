export const formatAddress = (address: string, firstNumbers: number = 6, lastNumbers: number = 8) => {
  if (address == null || address.length < 16 || address.length < firstNumbers + lastNumbers) return address;
  return address.slice(0, firstNumbers) + ".." + address.slice(-lastNumbers);
};
