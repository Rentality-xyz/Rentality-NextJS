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

  const checkInTrip = async (tripId: number, params:string[]) => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("checkInTrip error: contract is null");
        return false;
      }
      const startFuelLevel = Number(params[0]);
      const startOdometr = Number(params[1]);

      let transaction = await rentalityContract.checkInByGuest(
        tripId,
        startFuelLevel,
        startOdometr
      );

      const result = await transaction.wait();
      console.log("result: " + JSON.stringify(result));
      return true;
    } catch (e) {
      alert("checkInTrip error:" + e);
      return false;
    }
  };

  const checkOutTrip = async (tripId: number, params:string[]) => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("checkOutTrip error: contract is null");
        return false;
      }

      const endFuelLevel = Number(params[0]);
      const endOdometr = Number(params[1]);

      let transaction = await rentalityContract.checkOutByGuest(
        tripId,
        endFuelLevel,
        endOdometr
      );

      const result = await transaction.wait();
      console.log("result: " + JSON.stringify(result));
      return true;
    } catch (e) {
      alert("checkOutTrip error:" + e);
      return false;
    }
  };

  const getAllowedActions = (tripStatus: TripStatus) => {
    const result: AllowedChangeTripAction[] = [];
    switch (tripStatus) {
      case TripStatus.Pending:
        break;
      case TripStatus.Comfirmed:
        break;
      case TripStatus.CheckedInByHost:
        result.push({ text: "Start", params:["Fuel level (0..8)", "Odometr"], action: checkInTrip });
        break;
      case TripStatus.Started:
        result.push({ text: "Finish", params:["Fuel level (0..8)", "Odometr"], action: checkOutTrip });
        break;
      case TripStatus.CheckedOutByGuest:
        break;
      case TripStatus.Finished:
        break;
      case TripStatus.Closed:
        break;
      case TripStatus.Rejected:
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

                const tokenURI = await rentalityContract.getCarMetadataURI(i.carId);
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
                  tripStart: new Date(Number(i.startDateTime)),
                  tripEnd: new Date(Number(i.endDateTime)),
                  locationStart: i.startLocation,
                  locationEnd: i.endLocation,
                  status: tripStatus,
                  allowedActions: getAllowedActions(tripStatus),
                  totalPrice:(Number(i.paymentInfo.totalDayPriceInUsdCents) / 100).toString(),
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

export default useGuestTrips;
