export type ContractChatInfo = {
  tripId: bigint;

  guestAddress: string;
  guestName: string;
  guestPhotoUrl: string;

  hostAddress: string;
  hostName: string;
  hostPhotoUrl: string;

  tripStatus: number;
  startDateTime: bigint;
  endDateTime: bigint;

  carBrand: string;
  carModel: string;
  carYearOfProduction: string;
  carMetadataUrl: string;
};
