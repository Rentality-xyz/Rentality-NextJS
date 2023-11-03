import { Contract, ethers } from "ethers";
import { useEffect, useState } from "react";
import { rentalityJSON } from "../../abis";
import { ContractCarInfo, validateContractCarInfo } from "@/model/blockchain/ContractCarInfo";
import { BaseCarInfo } from "@/model/BaseCarInfo";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";

const useMyListings = () => {
  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [myListings, setMyListings] = useState<BaseCarInfo[]>([]);

  const getRentalityContract = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = await provider.getSigner();
      return new Contract(rentalityJSON.address, rentalityJSON.abi, signer) as unknown as IRentalityContract;
    } catch (e) {
      console.error("getRentalityContract error:" + e);
    }
  };

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
    getRentalityContract()
      .then((contract) => {
        if (contract !== undefined) {
          return getMyListings(contract);
        }
      })
      .then((data) => {
        setMyListings(data ?? []);
        setDataFetched(true);
      })
      .catch(() => setDataFetched(true));
  }, []);

  return [dataFetched, myListings] as const;
};

export default useMyListings;
