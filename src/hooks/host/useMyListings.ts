import { Contract, BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import RentCarJSON from "../../abis";
import { ContractCarToRent, validateContractCarToRent } from "@/model/blockchain/ContractCarToRent";
import { CarInfo } from "@/model/CarInfo";

const useMyListings = () => {
  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [myListings, setMyListings] = useState<CarInfo[]>([]);

  const getRentalityContract = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      return new Contract(RentCarJSON.address, RentCarJSON.abi, signer);
    } catch (e) {
      console.error("getRentalityContract error:" + e);
    }
  };

  const getMyListings = async (rentalityContract: Contract) => {
    try {
      if (rentalityContract === null) {
        console.error("getMyListings error: contract is null");
        return;
      }
      const myListingsView: ContractCarToRent[] =
        await rentalityContract.getMyCars();

      const myListingsData = await Promise.all(
        myListingsView.map(async (i: ContractCarToRent, index) => {
          if (index === 0) {
            validateContractCarToRent(i);
          }
          const tokenURI = await rentalityContract.tokenURI(i.tokenId);
          const response = await fetch(tokenURI, {
            headers: {
              'Accept': 'application/json',
            },
          });
          const meta = await response.json();

          const price = Number(i.pricePerDayInUsdCents) / 100;

          let item: CarInfo = {
            tokenId: Number(i.tokenId),
            owner: i.owner.toString(),
            image: meta.image,
            brand:
              meta.attributes?.find((x: any) => x.trait_type === "Brand")
                ?.value ?? "",
            model:
              meta.attributes?.find((x: any) => x.trait_type === "Model")
                ?.value ?? "",
            year:
              meta.attributes?.find((x: any) => x.trait_type === "Release year")
                ?.value ?? "",
            licensePlate:
              meta.attributes?.find(
                (x: any) => x.trait_type === "License plate"
              )?.value ?? "",
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
