import {
  ContractCarInfo,
  ContractClaimTypeV2,
  ContractClaimV2,
  ContractFullClaimInfo, ContractUserCurrencyDTO,
} from "@/model/blockchain/schemas";

export type HostInsuranceClaim = {
  claimId: number;
  host: string;
  guest: string;
  guestPhoneNumber: string;
  hostPhoneNumber: string;
  amountInEth: number;
  timeZoneId: string;
}

export function mapContractFullClaimInfoToHostInsuranceClaim(
  contractFullClaimInfo: ContractFullClaimInfo
): HostInsuranceClaim {
  console.log("mapper my");
  console.log(contractFullClaimInfo);
  console.log(contractFullClaimInfo.host)
  return {
    claimId: Number(contractFullClaimInfo.claim.claimId),
    host: contractFullClaimInfo.host,
    guest: contractFullClaimInfo.guest,
    guestPhoneNumber: contractFullClaimInfo.guestPhoneNumber,
    hostPhoneNumber: contractFullClaimInfo.hostPhoneNumber,
    amountInEth: Number(contractFullClaimInfo.amountInEth),
    timeZoneId: contractFullClaimInfo.timeZoneId,

    // claim: ContractClaimV2;
    // carInfo: ContractCarInfo;
    // claimType: ContractClaimTypeV2;
    // currency: ContractUserCurrencyDTO;
  };
}