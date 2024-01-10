import { validateType } from "@/utils/typeValidator";

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

export function validateContractChatInfo(obj: ContractChatInfo): obj is ContractChatInfo {
  if (typeof obj !== "object" || obj == null) return false;
  const emptyContractChatInfo: ContractChatInfo = {
    tripId: BigInt(0),

    guestAddress: "",
    guestName: "",
    guestPhotoUrl: "",

    hostAddress: "",
    hostName: "",
    hostPhotoUrl: "",

    tripStatus: 0,
    startDateTime: BigInt(0),
    endDateTime: BigInt(0),

    carBrand: "",
    carModel: "",
    carYearOfProduction: "",
    carMetadataUrl: "",
  };

  return validateType(obj, emptyContractChatInfo);
}
