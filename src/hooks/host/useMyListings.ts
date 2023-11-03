import { useEffect, useState } from "react";
import { ContractCarInfo, validateContractCarInfo } from "@/model/blockchain/ContractCarInfo";
import { BaseCarInfo } from "@/model/BaseCarInfo";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { useRentality } from "@/contexts/rentalityContext";

const useMyListings = () => {
  const rentalityInfo = useRentality();
  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [myListings, setMyListings] = useState<BaseCarInfo[]>([]);

  const getMyListings = async (rentalityContract: IRentalityContract) => {
    try {
      if (rentalityContract == null) {
        console.error("getMyListings error: contract is null");
        return;
      }
      const myListingsView: ContractCarInfo[] = await rentalityContract.getMyCars();

      const myListingsData =
        myListingsView.length === 0
          ? []
          : await Promise.all(
              myListingsView.map(async (i: ContractCarInfo, index) => {
                if (index === 0) {
                  validateContractCarInfo(i);
                }
                const tokenURI = await rentalityContract.getCarMetadataURI(i.carId);
                const meta = await getMetaDataFromIpfs(tokenURI);

                const price = Number(i.pricePerDayInUsdCents) / 100;

                let item: BaseCarInfo = {
                  carId: Number(i.carId),
                  ownerAddress: i.createdBy.toString(),
                  image: getIpfsURIfromPinata(meta.image),
                  brand: meta.attributes?.find((x: any) => x.trait_type === "Brand")?.value ?? "",
                  model: meta.attributes?.find((x: any) => x.trait_type === "Model")?.value ?? "",
                  year: meta.attributes?.find((x: any) => x.trait_type === "Release year")?.value ?? "",
                  licensePlate: meta.attributes?.find((x: any) => x.trait_type === "License plate")?.value ?? "",
                  pricePerDay: price,
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
    if (!rentalityInfo) return;

    getMyListings(rentalityInfo.rentalityContract)
      .then((data) => {
        setMyListings(data ?? []);
        setDataFetched(true);
      })
      .catch(() => setDataFetched(true));
  }, [rentalityInfo]);

  return [dataFetched, myListings] as const;
};

export default useMyListings;
