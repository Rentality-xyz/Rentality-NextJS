import { Contract, BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import { rentalityJSON } from "../../abis";
import {
  ContractTrip,
  getTripStatusFromContract,
  validateContractTrip,
} from "@/model/blockchain/ContractTrip";
import {
  TripInfo,
  AllowedChangeTripAction,
  TripStatus,
} from "@/model/TripInfo";
import { getIpfsURIfromPinata } from "@/utils/ipfsUtils";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";

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
      return new Contract(
        rentalityJSON.address,
        rentalityJSON.abi,
        signer
      ) as unknown as IRentalityContract;
    } catch (e) {
      console.error("getRentalityContract error:" + e);
    }
  };

  const acceptRequest = async (tripId: bigint, params: string[]) => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("acceptRequest error: contract is null");
        return false;
      }

      let transaction = await rentalityContract.approveTripRequest(tripId);
      const result = await transaction.wait();
      return true;
    } catch (e) {
      alert("acceptRequest error:" + e);
      return false;
    }
  };

  const rejectRequest = async (tripId: bigint, params: string[]) => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("rejectRequest error: contract is null");
        return false;
      }

      let transaction = await rentalityContract.rejectTripRequest(tripId);

      const result = await transaction.wait();
      return true;
    } catch (e) {
      alert("rejectRequest error:" + e);
      return false;
    }
  };

  const checkInTrip = async (tripId: bigint, params: string[]) => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("checkInTrip error: contract is null");
        return false;
      }
      const startFuelLevelInPermille = BigInt(params[0]) * BigInt(125);
      const startOdometr = BigInt(params[1]);

      let transaction = await rentalityContract.checkInByHost(
        tripId,
        startFuelLevelInPermille,
        startOdometr
      );

      const result = await transaction.wait();
      return true;
    } catch (e) {
      alert("checkInTrip error:" + e);
      return false;
    }
  };

  const checkOutTrip = async (tripId: bigint, params: string[]) => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("checkOutTrip error: contract is null");
        return false;
      }

      const endFuelLevelInPermille = BigInt(params[0]) * BigInt(125);
      const endOdometr = BigInt(params[1]);

      let transaction = await rentalityContract.checkOutByHost(
        tripId,
        endFuelLevelInPermille,
        endOdometr
      );

      const result = await transaction.wait();
      return true;
    } catch (e) {
      alert("checkOutTrip error:" + e);
      return false;
    }
  };

  const finishTrip = async (tripId: bigint, params: string[]) => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("finishTrip error: contract is null");
        return false;
      }

      let transaction = await rentalityContract.finishTrip(tripId);

      const result = await transaction.wait();
      return true;
    } catch (e) {
      alert("finishTrip error" + e);
      return false;
    }
  };

  const getAllowedActions = (tripStatus: TripStatus, i: ContractTrip) => {
    const result: AllowedChangeTripAction[] = [];

    switch (tripStatus) {
      case TripStatus.Pending:
        result.push({ text: "Confirm", params: [], action: acceptRequest });
        result.push({ text: "Reject", params: [], action: rejectRequest });
        break;
      case TripStatus.Comfirmed:
        result.push({
          text: "Start",
          params: ["Fuel level (0..8)", "Odometr"],
          action: checkInTrip,
        });
        break;
      case TripStatus.CheckedInByHost:
        break;
      case TripStatus.Started:
        break;
      case TripStatus.CheckedOutByGuest:
        result.push({
          text: "Finish",
          params: ["Fuel level (0..8)", "Odometr"],
          action: checkOutTrip,
        });
        break;
      case TripStatus.Finished:
        result.push({ text: "Complete", params: [], action: finishTrip });
        break;
      case TripStatus.Closed:
        break;
      case TripStatus.Rejected:
      default:
        break;
    }
    return result;
  };

  const getTrips = async (rentalityContract: IRentalityContract) => {
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
                const ipfsURI = getIpfsURIfromPinata(tokenURI);
                const response = await fetch(ipfsURI, {
                  headers: {
                    Accept: "application/json",
                  },
                });
                const meta = await response.json();
                const tripStatus = getTripStatusFromContract(Number(i.status));

                let item: TripInfo = {
                  tripId: Number(i.tripId),
                  carId: Number(i.carId),
                  image: getIpfsURIfromPinata(meta.image),
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
                  tripStart: new Date(Number(i.startDateTime) * 1000),
                  tripEnd: new Date(Number(i.endDateTime) * 1000),
                  locationStart: i.startLocation,
                  locationEnd: i.endLocation,
                  status: tripStatus,
                  allowedActions: getAllowedActions(tripStatus, i),
                  totalPrice: (
                    Number(i.paymentInfo.totalDayPriceInUsdCents) / 100
                  ).toString(),
                };
                return item;
              })
            );

      return tripsBookedData;
    } catch (e) {
      console.error("getTrips error:" + e);
    }
  };

  const isTripBooked = (status: TripStatus) => {
    return status !== TripStatus.Rejected && status !== TripStatus.Closed;
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
          data
            ?.filter((i) => {
              return isTripBooked(i.status);
            })
            .reverse() ?? []
        );
        setTripsHistory(
          data
            ?.filter((i) => {
              return !isTripBooked(i.status);
            })
            .reverse() ?? []
        );
        setDataFetched(true);
      })
      .catch(() => setDataFetched(true));
  }, []);

  return [dataFetched, tripsBooked, tripsHistory] as const;
};

export default useHostTrips;
