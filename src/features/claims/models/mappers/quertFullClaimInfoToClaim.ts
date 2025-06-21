import { Claim, getClaimStatusTextFromStatus, getClaimTypeTextFromClaimType } from "..";
import { formatPhoneNumber, getDateFromBlockchainTime } from "@/utils/formInput";
import { getIpfsURI } from "@/utils/ipfsUtils";

import { QueryClaimInfo } from "@/pages/api/getQueryClaims";


export function queryFullClaimInfoToClaimV2(
  claimInfo: QueryClaimInfo,
  isHost: boolean
): Claim {
  return {
    claimId: Number(claimInfo.id),
    tripId: Number(claimInfo.trip.id),
    deadlineDate: getDateFromBlockchainTime(
      claimInfo.deadlineDateInSec
    ),

    claimType: BigInt(claimInfo.claimTypeV2.claimType),
    claimTypeText: getClaimTypeTextFromClaimType(
      BigInt(claimInfo.claimTypeV2.claimType)
    ),
    status: BigInt(claimInfo.status),
    statusText: getClaimStatusTextFromStatus(BigInt(claimInfo.status)),
    carInfo: `${claimInfo.car.car.brand} ${claimInfo.car.car.model} ${claimInfo.car.car.yearOfProduction}`,
    description: claimInfo.description,
    amountInUsdCents: Number(claimInfo.amountInUsdCents),
    amountInEth: BigInt(claimInfo.amountInEth),
    payDateInSec: Number(claimInfo.payDateInSec),
    rejectedBy: claimInfo.rejectedBy.id,
    rejectedDateInSec: Number(claimInfo.rejectedDateInSec),
    hostPhoneNumber: formatPhoneNumber(
      claimInfo.host.mobilePhoneNumber
    ),
    guestPhoneNumber: formatPhoneNumber(
      claimInfo.guest.mobilePhoneNumber
    ),
    isIncomingClaim: isHost !== claimInfo.isHostClaims,
    fileUrls: claimInfo.photosUrl.split("|").map((url) => getIpfsURI(url)),
    timeZoneId: claimInfo.car.car.locationInfo.timeZoneId,
    currency: claimInfo.trip.paymentInfo.currencyType,
  };
}