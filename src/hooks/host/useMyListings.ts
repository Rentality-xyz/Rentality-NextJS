import { useEffect, useState } from "react";
import { BaseCarInfo } from "@/model/BaseCarInfo";
import { getIpfsURI, getMetaDataFromIpfs, parseMetaData } from "@/utils/ipfsUtils";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { validateContractCarInfoDTO } from "@/model/blockchain/schemas_utils";
import { ContractCarInfoDTO } from "@/model/blockchain/schemas";

const useMyListings = () => {
  const { rentalityContracts } = useRentality();
  const [isLoadingMyListings, setIsLoadingMyListings] = useState<boolean>(true);
  const [myListings, setMyListings] = useState<BaseCarInfo[]>([]);

  const getMyListings = async (rentalityContracts: IRentalityContracts) => {
    try {
      if (!rentalityContracts) {
        console.error("getMyListings error: contract is null");
        return;
      }
      const myListingsView: ContractCarInfoDTO[] = await rentalityContracts.gateway.getMyCars();

      if (myListingsView.length > 0) {
        validateContractCarInfoDTO(myListingsView[0]);
      }

      const myListingsData =
        myListingsView.length === 0
          ? []
          : await Promise.all(
              myListingsView.map(async (carDto) => {
                const metaData = parseMetaData(await getMetaDataFromIpfs(carDto.metadataURI));

                const pricePerDay = Number(carDto.carInfo.pricePerDayInUsdCents) / 100;
                const securityDeposit = Number(carDto.carInfo.securityDepositPerTripInUsdCents) / 100;
                const milesIncludedPerDay = Number(carDto.carInfo.milesIncludedPerDay);

                let item: BaseCarInfo = {
                  carId: Number(carDto.carInfo.carId),
                  ownerAddress: carDto.carInfo.createdBy.toString(),
                  image: getIpfsURI(metaData.mainImage),
                  brand: carDto.carInfo.brand,
                  model: carDto.carInfo.model,
                  year: carDto.carInfo.yearOfProduction.toString(),
                  licensePlate: metaData.licensePlate,
                  pricePerDay: pricePerDay,
                  securityDeposit: securityDeposit,
                  milesIncludedPerDay: milesIncludedPerDay,
                  currentlyListed: carDto.carInfo.currentlyListed,
                  isEditable: carDto.isEditable,
                  vinNumber: carDto.carInfo.carVinNumber,
                  dimoTokenId: Number(carDto.dimoTokenId),
                };
                return item;
              })
            );

      return myListingsData;
    } catch (e) {
      console.error("getMyListings error:" + e);
    }
  };

  useEffect(() => {
    if (!rentalityContracts) return;

    getMyListings(rentalityContracts)
      .then((data) => {
        setMyListings(data ?? []);
        setIsLoadingMyListings(false);
      })
      .catch(() => setIsLoadingMyListings(false));
  }, [rentalityContracts]);

  return [isLoadingMyListings, myListings] as const;
};

export default useMyListings;
