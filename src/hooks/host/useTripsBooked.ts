import { Contract, BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import { rentalityJSON } from "../../abis";
import { TripInfo, TripStatus } from "@/components/host/tripItem";
import {
  ContractTrip,
  validateContractTrip,
} from "@/model/blockchain/ContractTrip";

const getTripStatus = (status: number) => {
  switch (status) {
    case 0:
      return TripStatus.Pending;
    case 1:
      return TripStatus.Comfirmed;
    case 2:
      return TripStatus.StartedByHost;
    case 3:
      return TripStatus.Started;
    case 4:
      return TripStatus.FinishedByGuest;
    case 5:
      return TripStatus.Finished;
    case 6:
      return TripStatus.Closed;
    case 7:
    default:
      return TripStatus.Rejected;
  }
};
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
        await rentalityContract.getTripsAsHost();

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
                  status: getTripStatus(Number(i.status)),
                };
                return item;
              })
            );

      return tripsBookedData;
    } catch (e) {
      console.error("getTripsBooked error:" + e);
    }
  };

  const acceptRequest = async (tripId:number) => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("acceptRequest error: contract is null");
        return false;
      }

      let transaction = await rentalityContract.approveTripRequest(tripId);
      const result = await transaction.wait();
      console.log("result: " + JSON.stringify(result));
      return true;
    } catch (e) {
      alert("acceptRequest error:" + e);
      return false;
    }
  }

  const rejectRequest = async (tripId:number) => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("acceptRequest error: contract is null");
        return false;
      }

      let transaction = await rentalityContract.rejectTripRequest(tripId);

      const result = await transaction.wait();
      console.log("result: " + JSON.stringify(result));
      return true;
    } catch (e) {
      alert("rejectRequest error:" + e);
      return false;
    }
  }

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

  return [dataFetched, tripsBooked,  acceptRequest, rejectRequest, finishTrip] as const;
};

export default useTripsBooked;
