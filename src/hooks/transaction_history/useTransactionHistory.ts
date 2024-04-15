import { useEffect, useMemo, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractTripDTO, TripStatus } from "@/model/blockchain/schemas";
import { TransactionHistoryInfo } from "@/model/TransactionHistoryInfo";
import { validateContractTripDTO } from "@/model/blockchain/schemas_utils";
import { getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { calculateDays } from "@/utils/date";
import { getDateFromBlockchainTime } from "@/utils/formInput";

const getCancellationFee = (tripDto: ContractTripDTO) => {
  return 0;
  if (tripDto.trip.status !== TripStatus.Rejected) return 0;
  if (tripDto.trip.transactionInfo.statusBeforeCancellation === TripStatus.Pending) return 0;

  const pricePerDayInUsd = Number(tripDto.trip.pricePerDayInUsdCents) / 100;
  if (tripDto.trip.transactionInfo.statusBeforeCancellation === TripStatus.Confirmed) return pricePerDayInUsd / 2;
  return pricePerDayInUsd;
};

const useTransactionHistory = (isHost: boolean) => {
  const rentalityInfo = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [transactionsHistory, setTransactionsHistory] = useState<TransactionHistoryInfo[]>([]);

  useEffect(() => {
    const getTransactionsHistory = async (rentalityContract: IRentalityContract) => {
      try {
        if (rentalityContract == null) {
          console.error("getTransactionsHistory error: contract is null");
          return;
        }
        const tripInfos = isHost ? await rentalityContract.getTripsAsHost() : await rentalityContract.getTripsAsGuest();

        const transactionHistoryData =
          tripInfos.length === 0
            ? []
            : await Promise.all(
                tripInfos.map(async (tripDto: ContractTripDTO, index) => {
                  if (index === 0) {
                    validateContractTripDTO(tripDto);
                  }

                  const meta = await getMetaDataFromIpfs(tripDto.metadataURI);

                  const brand = meta.attributes?.find((x: any) => x.trait_type === "Brand")?.value ?? "";
                  const model = meta.attributes?.find((x: any) => x.trait_type === "Model")?.value ?? "";
                  const year = meta.attributes?.find((x: any) => x.trait_type === "Release year")?.value ?? "";
                  const carDescription = `${brand} ${model} ${year}`;

                  const startDateTime = getDateFromBlockchainTime(tripDto.trip.startDateTime);
                  const endDateTime = getDateFromBlockchainTime(tripDto.trip.endDateTime);
                  const tripPayment =
                    Number(
                      tripDto.trip.paymentInfo.totalDayPriceInUsdCents +
                        tripDto.trip.paymentInfo.depositInUsdCents +
                        tripDto.trip.paymentInfo.taxPriceInUsdCents
                    ) / 100;

                  const cancellationFee = getCancellationFee(tripDto);
                  const reimbursements = Number(tripDto.trip.paymentInfo.resolveAmountInUsdCents) / 100;

                  let item: TransactionHistoryInfo = {
                    transHistoryId: Number(tripDto.trip.tripId),
                    tripId: Number(tripDto.trip.tripId),
                    car: carDescription,
                    status: tripDto.trip.status,
                    days: calculateDays(startDateTime, endDateTime),
                    startDateTime: startDateTime,
                    endDateTime: endDateTime,
                    tripPayment: tripPayment,
                    refund: Number(tripDto.trip.transactionInfo.depositRefund) / 100,
                    tripEarnings: Number(tripDto.trip.transactionInfo.tripEarnings) / 100,
                    cancellationFee: cancellationFee,
                    reimbursements: reimbursements,
                    rentalityFee: Number(tripDto.trip.transactionInfo.rentalityFee) / 100,
                    taxes: Number(tripDto.trip.paymentInfo.taxPriceInUsdCents) / 100,
                  };
                  return item;
                })
              );

        return transactionHistoryData;
      } catch (e) {
        console.error("getTransactionHistory error:" + e);
      }
    };

    if (!rentalityInfo) return;

    setIsLoading(false);

    getTransactionsHistory(rentalityInfo)
      .then((data) => {
        setTransactionsHistory(data ?? []);
        setIsLoading(true);
      })
      .catch(() => setIsLoading(true));
  }, [rentalityInfo, isHost]);

  const sortedTransactionsHistory = useMemo(() => {
    return [...transactionsHistory].sort((a, b) => {
      return b.startDateTime.getTime() - a.startDateTime.getTime();
    });
  }, [transactionsHistory]);

  return [isLoading, sortedTransactionsHistory] as const;
};

export default useTransactionHistory;
