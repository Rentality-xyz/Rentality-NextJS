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

const useHostTrips = () => {
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

  const acceptRequest = async (tripId: number) => {
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
  };

  const rejectRequest = async (tripId: number) => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("rejectRequest error: contract is null");
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

      let transaction = await rentalityContract.checkInByHost(tripId, startFuelLevel, startOdometr);

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

      let transaction = await rentalityContract.checkOutByHost(tripId, endFuelLevel, endOdometr);

      const result = await transaction.wait();
      console.log("result: " + JSON.stringify(result));
      return true;
    } catch (e) {
      alert("checkOutTrip error:" + e);
      return false;
    }
  };

  const finishTrip = async (tripId: number) => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("finishTrip error: contract is null");
        return false;
      }

      let transaction = await rentalityContract.finishTrip(tripId);

      const result = await transaction.wait();
      console.log("result: " + JSON.stringify(result));
      return true;
    } catch (e) {
      alert("finishTrip error" + e);
      return false;
    }
  };

  const reportIssue = async (tripId: number) => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("reportIssue error: contract is null");
        return false;
      }

      const fuelPricePerGal = 0;
      let transaction = await rentalityContract.resolveIssue(tripId, fuelPricePerGal);

      const result = await transaction.wait();
      console.log("result: " + JSON.stringify(result));
      return true;
    } catch (e) {
      alert("reportIssue error" + e);
      return false;
    }
  };

  const getAllowedActions = (statusText: string) => {
    const result: AllowedChangeTripAction[] = [];

    switch (statusText) {
      case "Pending":
        result.push({ text: "Confirm", action: acceptRequest });
        result.push({ text: "Reject", action: rejectRequest });
        break;
      case "Comfirmed":
        result.push({ text: "Check-in", action: checkInTrip });
        break;
      case "StartedByHost":
        break;
      case "Started":
        break;
      case "FinishedByGuest":
        result.push({ text: "Check-out", action: checkOutTrip });
        break;
      case "Finished":
        result.push({ text: "Finish trip", action: finishTrip });
        result.push({ text: "Report issue", action: reportIssue });
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
        setTripsBooked(
          data?.filter((i) => {
            return isTripBooked(i.statusText);
          }) ?? []
        );
        setTripsHistory(
          data?.filter((i) => {
            return !isTripBooked(i.statusText);
          }) ?? []
        );
        setDataFetched(true);
      })
      .catch(() => setDataFetched(true));
  }, []);

  return [
    dataFetched,
    tripsBooked,
    tripsHistory
  ] as const;
};

export default useHostTrips;
