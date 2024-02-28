import { validateType } from "@/utils/typeValidator";
import { ContractCarInfo, emptyContractCarInfo } from "./ContractCarInfo";

export type ContractAvailableCarInfo = {
  car: ContractCarInfo;
  hostPhotoUrl: string;
  hostName: string;
};

export function validateContractAvailableCarInfo(obj: ContractAvailableCarInfo): obj is ContractAvailableCarInfo {
  if (typeof obj !== "object" || obj == null) return false;
  const emptyContractAvailableCarInfo: ContractAvailableCarInfo = {
    car: emptyContractCarInfo,
    hostName: "",
    hostPhotoUrl: "",
  };

  return validateType(obj, emptyContractAvailableCarInfo);
}
