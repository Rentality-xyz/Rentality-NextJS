import { ContractFullClaimInfo } from "@/model/blockchain/schemas";
import { Claim, getClaimStatusTextFromStatus, getClaimTypeTextFromClaimType } from "..";
import { formatPhoneNumber, getDateFromBlockchainTime } from "@/utils/formInput";
import { getIpfsURI } from "@/utils/ipfsUtils";

export function contractFullClaimInfoToClaim(contractClaimInfo: ContractFullClaimInfo, isHost: boolean): Claim {
  return {
    claimId: Number(contractClaimInfo.claim.claimId),
    tripId: Number(contractClaimInfo.claim.tripId),
    deadlineDate: getDateFromBlockchainTime(contractClaimInfo.claim.deadlineDateInSec),
    claimType: contractClaimInfo.claim.claimType,
    claimTypeText: getClaimTypeTextFromClaimType(contractClaimInfo.claim.claimType),
    status: contractClaimInfo.claim.status,
    statusText: getClaimStatusTextFromStatus(contractClaimInfo.claim.status),
    carInfo: `${contractClaimInfo.carInfo.brand} ${contractClaimInfo.carInfo.model} ${contractClaimInfo.carInfo.yearOfProduction}`,
    description: contractClaimInfo.claim.description,
    amountInUsdCents: Number(contractClaimInfo.claim.amountInUsdCents),
    amountInEth: contractClaimInfo.amountInEth,
    payDateInSec: Number(contractClaimInfo.claim.payDateInSec),
    rejectedBy: contractClaimInfo.claim.rejectedBy,
    rejectedDateInSec: Number(contractClaimInfo.claim.rejectedDateInSec),
    hostPhoneNumber: formatPhoneNumber(contractClaimInfo.hostPhoneNumber),
    guestPhoneNumber: formatPhoneNumber(contractClaimInfo.guestPhoneNumber),
    isIncomingClaim: isHost !== contractClaimInfo.claim.isHostClaims,
    fileUrls: contractClaimInfo.claim.photosUrl.split("|").map((url) => getIpfsURI(url)),
    timeZoneId: contractClaimInfo.timeZoneId,
  };
}
