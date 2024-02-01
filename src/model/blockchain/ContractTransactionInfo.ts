import { validateType } from "@/utils/typeValidator";
import { TripStatus } from "../TripInfo";

export type ContractTransactionInfo = {
  rentalityFee: bigint;
  depositRefund: bigint;
  tripEarnings: bigint;
  dateTime: bigint;
  statusBeforeCancellation: TripStatus;
};

export const emptyContractTransactionInfo: ContractTransactionInfo = {
  rentalityFee: BigInt(0),
  depositRefund: BigInt(0),
  tripEarnings: BigInt(0),
  dateTime: BigInt(0),
  statusBeforeCancellation: TripStatus.Pending,
};

export function validateContractTransactionInfo(obj: ContractTransactionInfo): obj is ContractTransactionInfo {
  return validateType(obj, emptyContractTransactionInfo);
}
