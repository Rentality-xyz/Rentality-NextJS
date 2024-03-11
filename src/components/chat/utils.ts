import { CreateClaimRequest } from "@/model/CreateClaimRequest";
import { dateFormatLongMonthDateTime } from "@/utils/datetimeFormatters";
import { getStringFromMoneyInCents } from "@/utils/formInput";
import moment from "moment";

const CLAIM_REQUEST_HEADER = "ClaimRequest";

export default function encodeClaimChatMessage(request: CreateClaimRequest) {
  return `${CLAIM_REQUEST_HEADER}|${moment().unix}|${request.amountInUsdCents}|${request.guestAddress}`;
}

export function isClaimChatMessage(message: string) {
  return message.startsWith(CLAIM_REQUEST_HEADER);
}

export function decodeClaimChatMessage(message: string, hostName: string, carDetails: string) {
  if (!message || !isClaimChatMessage(message)) {
    return message;
  }
  const [a, unixTimeStamp, amountInUsdCents, guestAddress] = message.split("|");

  return `Claim requested
  ${dateFormatLongMonthDateTime(moment.unix(Number(unixTimeStamp)).toDate())}
  ${hostName} sent you a new invoice for $${getStringFromMoneyInCents(
    Number(amountInUsdCents)
  )} due for incidentals incurred during your trip with ${hostName}'s ${carDetails}.
  Please respond to this invoice by ${dateFormatLongMonthDateTime(
    moment.unix(Number(unixTimeStamp)).add(3, "days").toDate()
  )}. If you don't respond in time, you may be unable to book again on Rentality.
  Ссылка на страницу Claims на  стороне Гостя`;
}
