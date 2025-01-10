import { calculateDays, UTC_TIME_ZONE_ID } from "@/utils/date";
import { getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { isEmpty } from "@/utils/string";
import { getMetaDataFromIpfs, parseMetaData } from "@/utils/ipfsUtils";
import { AdminTripStatus, ContractTrip, PaymentStatus, TripStatus } from "@/model/blockchain/schemas";
import { formatLocationInfoUpToCity, LocationInfo } from "@/model/LocationInfo";
import { AdminTripDetails } from "../AdminTripDetails";

function getAdminStatusFromTrip(trip: ContractTrip): AdminTripStatus {
  switch (trip.status) {
    case TripStatus.Pending: // Created
      return AdminTripStatus.Created;
    case TripStatus.Confirmed: // Approved
      return AdminTripStatus.Approved;
    case TripStatus.CheckedInByHost: // CheckedInByHost
      return AdminTripStatus.CheckedInByHost;
    case TripStatus.Started: // CheckedInByGuest
      return AdminTripStatus.CheckedInByGuest;
    case TripStatus.CheckedOutByGuest: //CheckedOutByGuest
      return AdminTripStatus.CheckedOutByGuest;
    case TripStatus.Finished: //CheckedOutByHost
      return trip.tripFinishedBy === trip.guest
        ? AdminTripStatus.CheckedOutByHost
        : AdminTripStatus.CompletedWithoutGuestConfirmation;
    case TripStatus.Closed: //Finished
      if (trip.tripFinishedBy === trip.guest) return AdminTripStatus.Finished;
      if (trip.tripFinishedBy === trip.host) return AdminTripStatus.CompletedByGuest;
      return AdminTripStatus.CompletedByAdmin;
    case TripStatus.Rejected: //Canceled
      if (trip.rejectedBy === trip.guest) {
        return trip.approvedDateTime === BigInt(0)
          ? AdminTripStatus.GuestCanceledBeforeApprove
          : AdminTripStatus.GuestCanceledAfterApprove;
      }
      if (trip.rejectedBy === trip.host) {
        return trip.approvedDateTime === BigInt(0)
          ? AdminTripStatus.HostCanceledBeforeApprove
          : AdminTripStatus.HostCanceledAfterApprove;
      }
      return AdminTripStatus.CompletedByAdmin;

    default:
      return AdminTripStatus.Any;
  }
}

function getPaymentStatusFromTrip(adminStatus: AdminTripStatus, trip: ContractTrip): PaymentStatus {
  switch (adminStatus) {
    case AdminTripStatus.Created:
    case AdminTripStatus.Approved:
    case AdminTripStatus.CheckedInByHost:
    case AdminTripStatus.CheckedInByGuest:
    case AdminTripStatus.CheckedOutByGuest:
    case AdminTripStatus.CheckedOutByHost:
      return PaymentStatus.Prepayment;

    case AdminTripStatus.GuestCanceledBeforeApprove:
    case AdminTripStatus.HostCanceledBeforeApprove:
    case AdminTripStatus.GuestCanceledAfterApprove:
    case AdminTripStatus.HostCanceledAfterApprove:
      return PaymentStatus.RefundToGuest;

    case AdminTripStatus.CompletedWithoutGuestConfirmation:
      return PaymentStatus.Unpaid;

    case AdminTripStatus.Finished:
    case AdminTripStatus.CompletedByGuest:
      return PaymentStatus.PaidToHost;

    case AdminTripStatus.CompletedByAdmin:
      if (isEmpty(trip.rejectedBy)) return PaymentStatus.PaidToHost;
      return PaymentStatus.RefundToGuest;

    default:
      return PaymentStatus.Any;
  }
}

export const mapContractTripToAdminTripDetails = async (
  trip: ContractTrip,
  locationInfo: LocationInfo,
  metadataURI: string
): Promise<AdminTripDetails> => {
  const timeZoneId: string = !isEmpty(locationInfo.timeZoneId) ? locationInfo.timeZoneId : UTC_TIME_ZONE_ID;
  const hostLocation = formatLocationInfoUpToCity(locationInfo);

  const metaData = parseMetaData(await getMetaDataFromIpfs(metadataURI));
  const plateNumber = metaData.licensePlate;
  const carDescription = `${metaData.brand} ${metaData.model} ${metaData.yearOfProduction}`;
  const adminTripStatus = getAdminStatusFromTrip(trip);
  const paymentStatus = getPaymentStatusFromTrip(adminTripStatus, trip);
  const tripStartDate = getDateFromBlockchainTimeWithTZ(trip.startDateTime, timeZoneId);
  const tripEndDate = getDateFromBlockchainTimeWithTZ(trip.endDateTime, timeZoneId);

  return {
    tripId: Number(trip.tripId),
    carDescription: carDescription,
    plateNumber: plateNumber,
    tripStatus: adminTripStatus,
    paymentsStatus: paymentStatus,
    hostLocation: hostLocation,
    tripStartDate: tripStartDate,
    tripEndDate: tripEndDate,
    timeZoneId: timeZoneId,
    tripDays: calculateDays(tripStartDate, tripEndDate),
    hostName: trip.hostName,
    guestName: trip.guestName,
    tripPriceBeforeDiscountInUsd: Number(trip.paymentInfo.totalDayPriceInUsdCents) / 100,
    tripDiscountInUsd: Number(trip.paymentInfo.totalDayPriceInUsdCents - trip.paymentInfo.priceWithDiscount) / 100,
    tripPriceAfterDiscountInUsd: Number(trip.paymentInfo.priceWithDiscount) / 100,
    deliveryFeePickUpInUsd: Number(trip.paymentInfo.pickUpFee) / 100,
    deliveryFeeDropOffInUsd: Number(trip.paymentInfo.dropOfFee) / 100,
    salesTaxInUsd: Number(trip.paymentInfo.salesTax) / 100,
    governmentTaxInUsd: Number(trip.paymentInfo.governmentTax) / 100,
    totalChargeForTripInUsd:
      Number(
        trip.paymentInfo.priceWithDiscount +
          trip.paymentInfo.governmentTax +
          trip.paymentInfo.salesTax +
          trip.paymentInfo.pickUpFee +
          trip.paymentInfo.dropOfFee
      ) / 100,
    refundForTripInUsd:
      paymentStatus === PaymentStatus.RefundToGuest ? Number(trip.transactionInfo.depositRefund) / 100 : undefined,
    depositReceivedInUsd: Number(trip.paymentInfo.depositInUsdCents) / 100.0,
    depositReturnedInUsd:
      paymentStatus === PaymentStatus.PaidToHost || paymentStatus === PaymentStatus.RefundToGuest
        ? Number(trip.paymentInfo.depositInUsdCents - trip.paymentInfo.resolveAmountInUsdCents) / 100.0
        : undefined,
    reimbursementInUsd:
      paymentStatus === PaymentStatus.PaidToHost ? Number(trip.paymentInfo.resolveAmountInUsdCents) / 100.0 : undefined,
    hostEarningsInUsd:
      paymentStatus === PaymentStatus.PaidToHost ? Number(trip.transactionInfo.tripEarnings) / 100 : undefined,
    platformCommissionInUsd:
      paymentStatus === PaymentStatus.PaidToHost ? Number(trip.transactionInfo.rentalityFee) / 100 : undefined,
    accruableSalesTaxInUsd:
      paymentStatus === PaymentStatus.PaidToHost ? Number(trip.paymentInfo.salesTax) / 100.0 : undefined,
    accruableGovernmentTaxInUsd:
      paymentStatus === PaymentStatus.PaidToHost ? Number(trip.paymentInfo.governmentTax) / 100.0 : undefined,
  };
};
