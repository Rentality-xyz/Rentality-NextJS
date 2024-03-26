import { useEffect, useState } from "react";
import { BaseCarInfo } from "@/model/BaseCarInfo";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { useRentality } from "@/contexts/rentalityContext";
import { validateContractCarInfo } from "@/model/blockchain/schemas_utils";
import { ContractCarInfo } from "@/model/blockchain/schemas";

const useHostPublicListings = (hostAddress: string) => {
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [hostPublicListings, setHostPublicListings] = useState<BaseCarInfo[]>([]);

  useEffect(() => {
    const fetchHostPublicListings = async () => {
      if (!rentalityContract) return;

      try {
        setIsLoading(true);
        const hostPublicListingsView: ContractCarInfo[] = await rentalityContract.getAllCars();

        const hostPublicListingsData =
          hostPublicListingsView.length === 0
            ? []
            : await Promise.all(
                hostPublicListingsView
                  .filter((i) => i.createdBy.toLowerCase() === hostAddress.toLowerCase())
                  .map(async (i: ContractCarInfo, index) => {
                    if (index === 0) {
                      validateContractCarInfo(i);
                    }
                    const metadataURI = await rentalityContract.getCarMetadataURI(i.carId);
                    const meta = await getMetaDataFromIpfs(metadataURI);

                    const pricePerDay = Number(i.pricePerDayInUsdCents) / 100;
                    const securityDeposit = Number(i.securityDepositPerTripInUsdCents) / 100;
                    const milesIncludedPerDay = Number(i.milesIncludedPerDay);

                    let item: BaseCarInfo = {
                      carId: Number(i.carId),
                      ownerAddress: i.createdBy.toString(),
                      image: getIpfsURIfromPinata(meta.image),
                      brand: meta.attributes?.find((x: any) => x.trait_type === "Brand")?.value ?? "",
                      model: meta.attributes?.find((x: any) => x.trait_type === "Model")?.value ?? "",
                      year: meta.attributes?.find((x: any) => x.trait_type === "Release year")?.value ?? "",
                      licensePlate: meta.attributes?.find((x: any) => x.trait_type === "License plate")?.value ?? "",
                      pricePerDay: pricePerDay,
                      securityDeposit: securityDeposit,
                      milesIncludedPerDay: milesIncludedPerDay,
                      currentlyListed: i.currentlyListed,
                      isEditable: false,
                    };
                    return item;
                  })
              );

        setHostPublicListings(hostPublicListingsData);
      } catch (e) {
        console.error("fetchHostPublicListings error:" + e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostPublicListings();
  }, [rentalityContract, hostAddress]);

  return [isLoading, hostPublicListings] as const;
};

export default useHostPublicListings;
