export type ContractPatrolEngineParams = {
  tankVolumeInGal: bigint;
  fuelPricePerGalInUsdCents: bigint;
};

export type ContractElectricEngineParams = {
  fromEmptyToTwenty: bigint;
  fromTwentyOneToFifty: bigint;
  fromFiftyOneToEighty: bigint;
  fromEightyOneToOneHundred: bigint;
};
