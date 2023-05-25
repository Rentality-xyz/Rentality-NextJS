import { Contract, BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import { rentalityJSON } from "../../abis";
import {
  ContractTrip,
  getTripStatusFromContract,
  validateContractTrip,
} from "@/model/blockchain/ContractTrip";
import { TripInfo, TripStatus } from "@/model/TripInfo";

const useGuestTrips = () => {
  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [tripsBooked, setTripsBooked] = useState<TripInfo[]>([]);
  const [tripsHistory, setTripsHistory] = useState<TripInfo[]>([]);

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

  const getTrips = async (rentalityContract: Contract) => {
    try {
      if (rentalityContract == null) {
        console.error("getTrips error: contract is null");
        return;
      }
      const tripsBookedView: ContractTrip[] =
        await rentalityContract.getTripsAsGuest();

      const tripsBookedData =
        tripsBookedView.length === 0
          ? []
          : await Promise.all(
              tripsBookedView.map(async (i: ContractTrip, index) => {
                if (index === 0) {
                  validateContractTrip(i);
                }

                const tokenURI = await rentalityContract.getCarMetadataURI(
                  i.carId
                );
                const response = await fetch(tokenURI, {
                  headers: {
                    Accept: "application/json",
                  },
                });
                const meta = await response.json();

                let item: TripInfo = {
                  tripId: Number(i.tripId),
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
                  tripStart: new Date(Number(i.startDateTime)),
                  tripEnd: new Date(Number(i.endDateTime)),
                  locationStart: i.startLocation,
                  locationEnd: i.endLocation,
                  status: getTripStatusFromContract(Number(i.status)),
                };
                return item;
              })
            );

      return tripsBookedData;
    } catch (e) {
      console.error("getTrips error:" + e);
    }
  };

  const finishTrip = async (tripId:number) => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("acceptRequest error: contract is null");
        return false;
      }

      let transaction = await rentalityContract.finishTrip(tripId);

      const result = await transaction.wait();
      console.log("result: " + JSON.stringify(result));
      return true;
    } catch (e) {
      alert("Upload error" + e);
      return false;
    }
  }

  const isTripBooked = (status:TripStatus) => {
    return status !== TripStatus.Rejected && status !== TripStatus.Finished && status !== TripStatus.Closed;
  }

  useEffect(() => {
    getRentalityContract()
      .then((contract) => {
        if (contract !== undefined) {
          return getTrips(contract);
        }
      })
      .then((data) => {
        setTripsBooked(data?.filter((i) => {return isTripBooked(i.status);}) ?? []);
        setTripsHistory(data?.filter((i) => {return !isTripBooked(i.status);}) ?? []);
        setDataFetched(true);
      })
      .catch(() => setDataFetched(true));
  }, []);

  return [dataFetched, tripsBooked, tripsHistory, finishTrip] as const;
};

export default useGuestTrips;
