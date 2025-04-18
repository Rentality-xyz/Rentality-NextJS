import { getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { isEmpty } from "@/utils/string";
import { getPromoPrice } from "@/features/promocodes/utils";
import { getDiscountablePrice, getNotDiscountablePrice } from "@/utils/price";
import { TransactionHistoryInfo } from "..";
import { ContractTripDTO, TripStatus } from "@/model/blockchain/schemas";
import { UTC_TIME_ZONE_ID } from "@/utils/constants";
import { calculateDaysByBlockchainLogic } from "@/utils/date";

function getCancellationFee(tripDto: ContractTripDTO) {
  return 0;
  if (tripDto.trip.status !== TripStatus.Rejected) return 0;
  if (tripDto.trip.transactionInfo.statusBeforeCancellation === TripStatus.Pending) return 0;

  const pricePerDayInUsd = Number(tripDto.trip.pricePerDayInUsdCents) / 100;
  if (tripDto.trip.transactionInfo.statusBeforeCancellation === TripStatus.Confirmed) return pricePerDayInUsd / 2;
  return pricePerDayInUsd;
}

export function mapContractTripDTOToTransactionHistoryInfo(tripDto: ContractTripDTO): TransactionHistoryInfo {
  const timeZoneId: string = !isEmpty(tripDto.timeZoneId) ? tripDto.timeZoneId : UTC_TIME_ZONE_ID;
  const carDescription = `${tripDto.brand} ${tripDto.model} ${tripDto.yearOfProduction}`;

  const startDateTime = getDateFromBlockchainTimeWithTZ(tripDto.trip.startDateTime, timeZoneId);
  const endDateTime = getDateFromBlockchainTimeWithTZ(tripDto.trip.endDateTime, timeZoneId);

  const totalPriceWithHostDiscountInUsd = Number(tripDto.trip.paymentInfo.priceWithDiscount) / 100.0;
  const pickUpDeliveryFeeInUsd = Number(tripDto.trip.paymentInfo.pickUpFee) / 100.0;
  const dropOffDeliveryFeeInUsd = Number(tripDto.trip.paymentInfo.dropOfFee) / 100.0;
  const salesTaxInUsd = Number(tripDto.trip.paymentInfo.salesTax) / 100.0;
  const governmentTaxInUsd = Number(tripDto.trip.paymentInfo.governmentTax) / 100.0;
  const depositInUsd = Number(tripDto.trip.paymentInfo.depositInUsdCents) / 100.0;

  const totalPriceInUsd =
    totalPriceWithHostDiscountInUsd +
    governmentTaxInUsd +
    salesTaxInUsd +
    pickUpDeliveryFeeInUsd +
    dropOffDeliveryFeeInUsd;
  const promoDiscountInPercents = Number(tripDto.promoDiscount);

  const totalTax = tripDto.taxesData.map((t) => Number(t.value) / 100).reduce((acc, curr) => acc + curr, 0);

  const tripPayment =
    promoDiscountInPercents > 0
      ? getPromoPrice(
          getDiscountablePrice(
            totalPriceWithHostDiscountInUsd,
            pickUpDeliveryFeeInUsd,
            dropOffDeliveryFeeInUsd,
            totalTax
          ),
          promoDiscountInPercents
        ) +
        (promoDiscountInPercents !== 100
          ? getNotDiscountablePrice(Number(tripDto.paidForInsuranceInUsdCents) / 100.0, depositInUsd)
          : 0)
      : totalPriceInUsd;

  const cancellationFee = getCancellationFee(tripDto);
  const reimbursements = Number(tripDto.trip.paymentInfo.resolveAmountInUsdCents) / 100;

  return {
    transHistoryId: Number(tripDto.trip.tripId),
    tripId: Number(tripDto.trip.tripId),
    car: carDescription,
    status: tripDto.trip.status,
    days: calculateDaysByBlockchainLogic(startDateTime, endDateTime),
    startDateTime: startDateTime,
    endDateTime: endDateTime,
    timeZoneId: tripDto.timeZoneId,
    tripPayment: tripPayment,
    refund: Number(tripDto.trip.transactionInfo.depositRefund) / 100,
    tripEarnings: Number(tripDto.trip.transactionInfo.tripEarnings) / 100,
    cancellationFee: cancellationFee,
    reimbursements: reimbursements,
    insuranceFeeInUsd: Number(tripDto.paidForInsuranceInUsdCents) / 100,
    rentalityFee: Number(tripDto.trip.transactionInfo.rentalityFee) / 100,
    taxes: totalTax,
  };
}
