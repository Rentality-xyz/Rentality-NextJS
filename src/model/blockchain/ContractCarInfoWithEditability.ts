import { validateType } from "@/utils/typeValidator";
import { ContractCarInfo, emptyContractCarInfo } from "./ContractCarInfo";

export type ContractCarInfoWithEditability = {
  carInfo: ContractCarInfo;
  metadataURI: string;
  isEditable: boolean;
};

export function validateContractCarInfoWithEditability(
  obj: ContractCarInfoWithEditability
): obj is ContractCarInfoWithEditability {
  if (typeof obj !== "object" || obj == null) return false;
  const emptyContractCarInfoWithEditability: ContractCarInfoWithEditability = {
    carInfo: emptyContractCarInfo,
    metadataURI: "",
    isEditable: false,
  };

  return validateType(obj, emptyContractCarInfoWithEditability);
}
