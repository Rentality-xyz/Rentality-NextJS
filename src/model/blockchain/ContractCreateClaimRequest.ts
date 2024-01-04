export type ContractCreateClaimRequest = {
  tripId: bigint;
  claimType: bigint; //ContractClaimType
  description: string;
  amountInUsdCents: bigint;
};
