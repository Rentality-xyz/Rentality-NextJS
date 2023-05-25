import { Contract, BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import { rentalityJSON } from "../../abis";
import {
  ContractTrip,
  getTripStatusTextFromContract,
  validateContractTrip,
} from "@/model/blockchain/ContractTrip";
import {
  TripInfo,
  AllowedChangeTripAction,
} from "@/model/TripInfo";

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

  const checkInTrip = async (tripId: number) => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("checkInTrip error: contract is null");
        return false;
      }
      const startFuelLevel = 0;
      const startOdometr = 0;

      let transaction = await rentalityContract.checkInByGuest(tripId, startFuelLevel, startOdometr);

      const result = await transaction.wait();
      console.log("result: " + JSON.stringify(result));
      return true;
    } catch (e) {
      alert("checkInTrip error:" + e);
      return false;
    }
  };

  const checkOutTrip = async (tripId: number) => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("checkOutTrip error: contract is null");
        return false;
      }

      const endFuelLevel = 0;
      const endOdometr = 0;

      let transaction = await rentalityContract.checkOutByGuest(tripId, endFuelLevel, endOdometr);

      const result = await transaction.wait();
      console.log("result: " + JSON.stringify(result));
      return true;
    } catch (e) {
      alert("checkOutTrip error:" + e);
      return false;
    }
  };

  const getAllowedActions = (statusText: string) => {
    const result: AllowedChangeTripAction[] = [];

    switch (statusText) {
      case "Pending":
        break;
      case "Comfirmed":
        break;
      case "StartedByHost":
        result.push({ text: "Check-in", action: checkInTrip });
        break;
      case "Started":
        result.push({ text: "Check-out", action: checkOutTrip });
        break;
      case "FinishedByGuest":
        break;
      case "Finished":
        break;
      case "Closed":
        break;
      case "Rejected":
      default:
        break;
    }
    return result;
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
                const statusText = getTripStatusTextFromContract(
                  Number(i.status)
                );

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
                  statusText: statusText,
                  allowedActions: getAllowedActions(statusText),
                };
                return item;
              })
            );

      return tripsBookedData;
    } catch (e) {
      console.error("getTrips error:" + e);
    }
  };

  const isTripBooked = (status: string) => {
    return (
      status !== "Rejected" &&
      status !== "Finished" &&
      status !== "Closed"
    );
  };

  useEffect(() => {
    getRentalityContract()
      .then((contract) => {
        if (contract !== undefined) {
          return getTrips(contract);
        }
      })
      .then((data) => {
        setTripsBooked(data?.filter((i) => {return isTripBooked(i.statusText);}) ?? []);
        setTripsHistory(data?.filter((i) => {return !isTripBooked(i.statusText);}) ?? []);
        setDataFetched(true);
      })
      .catch(() => setDataFetched(true));
  }, []);

  return [dataFetched, tripsBooked, tripsHistory] as const;
};

export default useGuestTrips;
