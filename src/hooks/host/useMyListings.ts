import { useEffect, useState } from "react";
import { BaseCarInfo } from "@/model/BaseCarInfo";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { useRentality } from "@/contexts/rentalityContext";
import { validateContractCarInfoWithEditability } from "@/model/blockchain/schemas_utils";
import { ContractCarInfoWithEditability } from "@/model/blockchain/schemas";

const useMyListings = () => {
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [myListings, setMyListings] = useState<BaseCarInfo[]>([]);

  const getMyListings = async (rentalityContract: IRentalityContract) => {
    try {
      if (rentalityContract == null) {
        console.error("getMyListings error: contract is null");
        return;
      }
      const myListingsView: ContractCarInfoWithEditability[] = await rentalityContract.getMyCars();

      const myListingsData =
        myListingsView.length === 0
          ? []
          : await Promise.all(
              myListingsView.map(async (i: ContractCarInfoWithEditability, index) => {
                if (index === 0) {
                  validateContractCarInfoWithEditability(i);
                }
                const meta = await getMetaDataFromIpfs(i.metadataURI);

                const pricePerDay = Number(i.carInfo.pricePerDayInUsdCents) / 100;
                const securityDeposit = Number(i.carInfo.securityDepositPerTripInUsdCents) / 100;
                const milesIncludedPerDay = Number(i.carInfo.milesIncludedPerDay);

                let item: BaseCarInfo = {
                  carId: Number(i.carInfo.carId),
                  ownerAddress: i.carInfo.createdBy.toString(),
                  image: getIpfsURIfromPinata(meta.image),
                  brand: meta.attributes?.find((x: any) => x.trait_type === "Brand")?.value ?? "",
                  model: meta.attributes?.find((x: any) => x.trait_type === "Model")?.value ?? "",
                  year: meta.attributes?.find((x: any) => x.trait_type === "Release year")?.value ?? "",
                  licensePlate: meta.attributes?.find((x: any) => x.trait_type === "License plate")?.value ?? "",
                  pricePerDay: pricePerDay,
                  securityDeposit: securityDeposit,
                  milesIncludedPerDay: milesIncludedPerDay,
                  currentlyListed: i.carInfo.currentlyListed,
                  isEditable: i.isEditable,
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
    if (!rentalityContract) return;

    getMyListings(rentalityContract)
      .then((data) => {
        setMyListings(data ?? []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [rentalityContract]);

  return [isLoading, myListings] as const;
};

export default useMyListings;
