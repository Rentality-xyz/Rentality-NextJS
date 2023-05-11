import { Contract, BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import RentCarJSON from "../abis";
import { TripInfo, TripStatus } from "@/components/host/tripItem";

type ContractCarToRent = {
  tokenId: number;
  carId: number;
  owner: string;
  pricePerDayInUsdCents: string;
  currentlyListed: boolean;
};

function validateContractCarToRent(
  obj: ContractCarToRent
): obj is ContractCarToRent {
  if (typeof obj !== "object" || obj === null) return false;

  if (obj.tokenId === undefined) {
    console.error("obj does not contain property tokenId");
    return false;
  }
  if (obj.carId === undefined) {
    console.error("obj does not contain property carId");
    return false;
  }
  if (obj.owner === undefined) {
    console.error("obj does not contain property owner");
    return false;
  }
  if (obj.pricePerDayInUsdCents === undefined) {
    console.error("obj does not contain property pricePerDayInUsdCents");
    return false;
  }
  if (obj.currentlyListed === undefined) {
    console.error("obj does not contain property currentlyListed");
    return false;
  }
  return true;
}

const useTripsBooked = () => {
  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [tripsBooked, setTripsBooked] = useState<TripInfo[]>([]);

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

  const getTripsBooked = async (rentalityContract: Contract) => {
    try {
      if (rentalityContract === null) {
        console.error("getTripsBooked error: contract is null");
        return;
      }
      const tripsBookedView: ContractCarToRent[] =
        await rentalityContract.getMyCars();

      const tripsBookedData = await Promise.all(
        tripsBookedView.map(async (i: ContractCarToRent, index) => {
          if (index === 0) {
            validateContractCarToRent(i);
          }
          const tokenURI = await rentalityContract.tokenURI(i.tokenId);
          const response = await fetch(tokenURI, {
            headers: {
              Accept: "application/json",
            },
          });
          const meta = await response.json();

          const price = Number(i.pricePerDayInUsdCents) / 100;

          let item: TripInfo = {
            tripId: Number(i.tokenId),
            carId: Number(i.tokenId),
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
            tripStart: "April 10, 4:00 AM",
            tripEnd: "April 10, 4:00 AM",
            locationStart: "Miami, CA, USA",
            locationEnd: "Miami, CA, USA",
            status: TripStatus.Pending,
          };
          return item;
        })
      );

      return tripsBookedData;
    } catch (e) {
      console.error("getTripsBooked error:" + e);
    }
  };

  useEffect(() => {
    getRentalityContract()
      .then((contract) => {
        if (contract !== undefined) {
          return getTripsBooked(contract);
        }
      })
      .then((data) => {
        setTripsBooked(data ?? []);
        setDataFetched(true);
      })
      .catch(() => setDataFetched(true));
  }, []);

  return [dataFetched, tripsBooked] as const;
};

export default useTripsBooked;
