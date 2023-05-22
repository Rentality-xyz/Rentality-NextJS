import { Contract, BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import { rentalityJSON } from "../../abis";
import { TripInfo, TripStatus } from "@/components/guest/tripItem";
import {
  ContractTrip,
  validateContractTrip,
} from "@/model/blockchain/ContractTrip";

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
      return new Contract(rentalityJSON.address, rentalityJSON.abi, signer);
    } catch (e) {
      console.error("getRentalityContract error:" + e);
    }
  };

  const getTripsBooked = async (rentalityContract: Contract) => {
    try {
      if (rentalityContract == null) {
        console.error("getTripsBooked error: contract is null");
        return;
      }
      const tripsBookedView: ContractTrip[] =
        await rentalityContract.getTripsByHost(rentalityContract.runner);

      const tripsBookedData =
        tripsBookedView.length === 0
          ? []
          : await Promise.all(
              tripsBookedView.map(async (i: ContractTrip, index) => {
                if (index === 0) {
                  validateContractTrip(i);
                }
                const tokenURI = await rentalityContract.getCarMetadataURI(i.carId);
                const response = await fetch(tokenURI, {
                  headers: {
                    Accept: "application/json",
                  },
                });
                const meta = await response.json();

                const price = Number(i.totalDayPrice) / 100;

                let item: TripInfo = {
                  tripId: Number(i.carId),
                  carId: Number(i.carId),
                  image: meta.image,
                  brand:
                    meta.attributes?.find((x: any) => x.trait_type === "Brand")
                      ?.value ?? "",
                  model:
                    meta.attributes?.find((x: any) => x.trait_type === "Model")
                      ?.value ?? "",
                  year:
                    meta.attributes?.find(
                      (x: any) => x.trait_type === "Release year"
                    )?.value ?? "",
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
