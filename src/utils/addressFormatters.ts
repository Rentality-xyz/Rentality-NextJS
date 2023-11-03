export const formatAddress = (address: string) => {
  if (address == null || address.length < 16) return address;
  return address.slice(0, 6) + ".." + address.slice(-8);
};
