import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import { ContractFullClaimInfo, ContractTripDTO, TripStatus } from "./blockchain/schemas";
import { getDateFromBlockchainTime } from "@/utils/formInput";
import { UTC_TIME_ZONE_ID, calculateDays } from "@/utils/date";
import { isEmpty } from "@/utils/string";
import { getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { displayMoneyFromCentsWith2Digits } from "@/utils/numericFormatters";

export type NotificationInfo = {
  id: string;
  type: NotificationType;
  title: string;
  datestamp: Date;
  message: string;
};

export enum NotificationType {
  Booked,
  History,
  Message,
  Claim,
}

export function createNotificationInfoFromTrip(
  status: TripStatus,
  tripDTO: ContractTripDTO,
  carDescription: string,
  timestamp: Date,
  isHost: boolean
): NotificationInfo | undefined {
  const timeZoneId = !isEmpty(tripDTO.timeZoneId) ? tripDTO.timeZoneId : UTC_TIME_ZONE_ID;
  const startDateTime = getDateFromBlockchainTime(tripDTO.trip.startDateTime);
  const endDateTime = getDateFromBlockchainTime(tripDTO.trip.endDateTime);
  const notificationId = `trip_${tripDTO.trip.tripId}_${status.toString()}`;

  switch (status) {
    case TripStatus.Pending:
      return {
        id: notificationId,
        type: NotificationType.Booked,
        title: `Trip requested`,
        datestamp: timestamp,
        message: isHost
          ? `${tripDTO.trip.guestName} wants to book you ${carDescription} ${dateFormatShortMonthDateTime(
              startDateTime,
              timeZoneId
            )} - ${dateFormatShortMonthDateTime(endDateTime, timeZoneId)} for $${displayMoneyFromCentsWith2Digits(
              tripDTO.trip.paymentInfo.totalDayPriceInUsdCents + tripDTO.trip.paymentInfo.depositInUsdCents
            )} including deposit $${displayMoneyFromCentsWith2Digits(tripDTO.trip.paymentInfo.depositInUsdCents)}`
          : `You sent a request to book ${carDescription}. Expect confirmation within 1 hour from Host.`,
      };
    case TripStatus.Rejected:
      const rejectedByHost = tripDTO.trip.rejectedBy === tripDTO.trip.host;
      return {
        id: notificationId,
        type: NotificationType.History,
        title: rejectedByHost ? `Trip rejected by Host` : `Trip rejected by Guest`,
        datestamp: timestamp,
        message: isHost
          ? rejectedByHost
            ? `You rejected ${tripDTO.trip.guestName}'s request to book your ${carDescription}`
            : `${tripDTO.trip.guestName} rejected their request to book your ${carDescription}`
          : rejectedByHost
            ? `${tripDTO.trip.hostName} rejected a request to book ${carDescription}.`
            : `You rejected a request to book ${carDescription}.`,
      };
    case TripStatus.Confirmed:
      return {
        id: notificationId,
        type: NotificationType.Booked,
        title: `Trip Confirmed`,
        datestamp: timestamp,
        message: isHost
          ? `You confirmed ${tripDTO.trip.guestName}'s request ${calculateDays(
              startDateTime,
              endDateTime
            )} days trip, with you ${carDescription}, ${dateFormatShortMonthDateTime(
              startDateTime,
              timeZoneId
            )} - ${dateFormatShortMonthDateTime(endDateTime, timeZoneId)} for $${displayMoneyFromCentsWith2Digits(
              tripDTO.trip.paymentInfo.totalDayPriceInUsdCents + tripDTO.trip.paymentInfo.depositInUsdCents
            )} including deposit $${displayMoneyFromCentsWith2Digits(tripDTO.trip.paymentInfo.depositInUsdCents)}`
          : `${tripDTO.trip.hostName} has confirmed your request for a ${calculateDays(
              startDateTime,
              endDateTime
            )}-day trip on ${carDescription}, scheduled from ${dateFormatShortMonthDateTime(
              startDateTime,
              timeZoneId
            )} to ${dateFormatShortMonthDateTime(endDateTime, timeZoneId)} for $${displayMoneyFromCentsWith2Digits(
              tripDTO.trip.paymentInfo.totalDayPriceInUsdCents + tripDTO.trip.paymentInfo.depositInUsdCents
            )} including a $${displayMoneyFromCentsWith2Digits(tripDTO.trip.paymentInfo.depositInUsdCents)} deposit`,
      };
    case TripStatus.CheckedInByHost:
      return isHost
        ? undefined
        : {
            id: notificationId,
            type: NotificationType.Booked,
            title: `Host check-in start trip`,
            datestamp: timestamp,
            message: `${
              tripDTO.trip.hostName
            } has confirmed the start of the trip #${tripDTO.trip.tripId.toString()} on ${carDescription}. Please confirms the start of the trip on your side`,
          };
    case TripStatus.Started:
      return isHost
        ? {
            id: notificationId,
            type: NotificationType.Booked,
            title: `Guest check-in start trip`,
            datestamp: timestamp,
            message: `${
              tripDTO.trip.guestName
            } confirms start trip #${tripDTO.trip.tripId.toString()} on ${carDescription}`,
          }
        : undefined;
    case TripStatus.CheckedOutByGuest:
      return isHost
        ? {
            id: notificationId,
            type: NotificationType.Booked,
            title: `Guest checked out`,
            datestamp: timestamp,
            message: `${
              tripDTO.trip.guestName
            } has marked trip #${tripDTO.trip.tripId.toString()} as finished on ${carDescription}`,
          }
        : undefined;
    case TripStatus.Finished:
      return isHost
        ? undefined
        : {
            id: notificationId,
            type: NotificationType.Booked,
            title: `Host checked out`,
            datestamp: timestamp,
            message: `${
              tripDTO.trip.hostName
            } has marked trip #${tripDTO.trip.tripId.toString()} as finished on ${carDescription}. Deposit returned after the Host marked the order as closed`,
          };
    case TripStatus.CompletedWithoutGuestComfirmation:
      return {
        id: notificationId,
        type: NotificationType.Booked,
        title: `Finish the trip without guest confirmation`,
        datestamp: timestamp,
        message: isHost
          ? `You finished the trip without guest confirmation. You will not receive the earnings until the guest confirms the completion of the trip. Contact the guest if necessary.`
          : `Host finished the trip without guest confirmation. Please confirm finish trip or contact the host.`,
      };
    case TripStatus.Closed:
      return tripDTO.trip.tripFinishedBy.toLowerCase() === tripDTO.trip.host.toLowerCase()
        ? {
            id: notificationId,
            type: NotificationType.History,
            title: isHost ? `Guest confirm finish trip` : "You confirm finish trip",
            datestamp: timestamp,
            message: isHost
              ? "The guest confirmed the completion of the trip."
              : "You confirmed the completion of the trip.",
          }
        : {
            id: notificationId,
            type: NotificationType.History,
            title: isHost ? `You completed trip` : `Host completed trip`,
            datestamp: timestamp,
            message: isHost
              ? `You closed the order #${tripDTO.trip.tripId.toString()} for ${
                  tripDTO.trip.guestName
                } trip on ${carDescription}. 
              Security deposit info:
              Received deposit $${displayMoneyFromCentsWith2Digits(tripDTO.trip.paymentInfo.depositInUsdCents)}
              ReFuel reimbursement $${displayMoneyFromCentsWith2Digits(tripDTO.trip.paymentInfo.resolveFuelAmountInUsdCents)}
              Overmiles reimbursement $${displayMoneyFromCentsWith2Digits(
                tripDTO.trip.paymentInfo.resolveMilesAmountInUsdCents
              )}
              Deposit returned $${displayMoneyFromCentsWith2Digits(
                tripDTO.trip.paymentInfo.depositInUsdCents -
                  tripDTO.trip.paymentInfo.resolveFuelAmountInUsdCents -
                  tripDTO.trip.paymentInfo.resolveMilesAmountInUsdCents
              )}`
              : `${
                  tripDTO.trip.hostName
                } closed the order #${tripDTO.trip.tripId.toString()} for your trip on ${carDescription}. 
              Security deposit info:
              Received deposit$${displayMoneyFromCentsWith2Digits(tripDTO.trip.paymentInfo.depositInUsdCents)}
              ReFuel reimbursement $${displayMoneyFromCentsWith2Digits(tripDTO.trip.paymentInfo.resolveFuelAmountInUsdCents)}
              Overmiles reimbursement $${displayMoneyFromCentsWith2Digits(
                tripDTO.trip.paymentInfo.resolveMilesAmountInUsdCents
              )}
              Deposit returned $${displayMoneyFromCentsWith2Digits(
                tripDTO.trip.paymentInfo.depositInUsdCents -
                  tripDTO.trip.paymentInfo.resolveFuelAmountInUsdCents -
                  tripDTO.trip.paymentInfo.resolveMilesAmountInUsdCents
              )}`,
          };
    default:
      return {
        id: notificationId,
        type: NotificationType.Booked,
        title: "Unknown status",
        datestamp: new Date(),
        message: `Trip has unknown status: ${tripDTO.trip.status.toString()} `,
      };
  }
}

export function createNotificationInfoFromClaim(
  tripDTO: ContractTripDTO,
  claimInfo: ContractFullClaimInfo,
  carDescription: string,
  timestamp: Date,
  isHost: boolean
): NotificationInfo | undefined {
  const timeZoneId = !isEmpty(tripDTO.timeZoneId) ? tripDTO.timeZoneId : UTC_TIME_ZONE_ID;
  const deadlineDateTime = getDateFromBlockchainTime(claimInfo.claim.deadlineDateInSec);
  const notificationId = `claim_${claimInfo.claim.claimId}_${claimInfo.claim.status.toString()}`;

  return {
    id: notificationId,
    type: NotificationType.Claim,
    title: `Claim requested`,
    datestamp: timestamp,
    message: isHost
      ? `You sent to the ${tripDTO.trip.guestName} a new invoice for $${displayMoneyFromCentsWith2Digits(
          claimInfo.claim.amountInUsdCents
        )} due for incidentals incurred during trip with you ${carDescription}.
      Payment deadline to this invoice by ${dateFormatShortMonthDateTime(deadlineDateTime, timeZoneId)}.
      Your complaints will be public.`
      : `You have a new invoice for $${displayMoneyFromCentsWith2Digits(
          claimInfo.claim.amountInUsdCents
        )} due for incidentals incurred during your trip with ${tripDTO.trip.hostName}'s ${carDescription}.
      Please respond to this invoice by ${dateFormatShortMonthDateTime(
        deadlineDateTime,
        timeZoneId
      )}. If you don't respond in time, you may be unable to book again on Rentality.
      `,
  };
}

export async function createCreateTripNotification(
  tripDTO: ContractTripDTO,
  isHost: boolean,
  eventDate: Date
): Promise<NotificationInfo | undefined> {
  const meta = await getMetaDataFromIpfs(tripDTO.metadataURI);

  const brand = tripDTO.brand ?? meta.attributes?.find((x: any) => x.trait_type === "Brand")?.value ?? "";
  const model = tripDTO.model ?? meta.attributes?.find((x: any) => x.trait_type === "Model")?.value ?? "";
  const year =
    tripDTO.yearOfProduction?.toString() ??
    meta.attributes?.find((x: any) => x.trait_type === "Release year")?.value ??
    "";
  const carDescription = `${brand} ${model} ${year}`;

  return createNotificationInfoFromTrip(TripStatus.Pending, tripDTO, carDescription, eventDate, isHost);
}

export async function createTripChangedNotification(
  tripStatus: TripStatus,
  tripDTO: ContractTripDTO,
  isHost: boolean,
  eventDate: Date
): Promise<NotificationInfo | undefined> {
  const meta = await getMetaDataFromIpfs(tripDTO.metadataURI);

  const brand = tripDTO.brand ?? meta.attributes?.find((x: any) => x.trait_type === "Brand")?.value ?? "";
  const model = tripDTO.model ?? meta.attributes?.find((x: any) => x.trait_type === "Model")?.value ?? "";
  const year =
    tripDTO.yearOfProduction?.toString() ??
    meta.attributes?.find((x: any) => x.trait_type === "Release year")?.value ??
    "";
  const carDescription = `${brand} ${model} ${year}`;

  const updatedTripStatus =
    tripStatus === TripStatus.Finished && tripDTO.trip.tripFinishedBy.toLowerCase() === tripDTO.trip.host.toLowerCase()
      ? TripStatus.CompletedWithoutGuestComfirmation
      : tripStatus;

  return createNotificationInfoFromTrip(updatedTripStatus, tripDTO, carDescription, eventDate, isHost);
}

export async function createClaimCreatedChangedNotification(
  tripDTO: ContractTripDTO,
  claimInfo: ContractFullClaimInfo,
  isHost: boolean,
  eventDate: Date
): Promise<NotificationInfo | undefined> {
  const meta = await getMetaDataFromIpfs(tripDTO.metadataURI);

  const brand = tripDTO.brand ?? meta.attributes?.find((x: any) => x.trait_type === "Brand")?.value ?? "";
  const model = tripDTO.model ?? meta.attributes?.find((x: any) => x.trait_type === "Model")?.value ?? "";
  const year =
    tripDTO.yearOfProduction?.toString() ??
    meta.attributes?.find((x: any) => x.trait_type === "Release year")?.value ??
    "";
  const carDescription = `${brand} ${model} ${year}`;

  return createNotificationInfoFromClaim(tripDTO, claimInfo, carDescription, eventDate, isHost);
}
