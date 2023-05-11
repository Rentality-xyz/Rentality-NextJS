import Head from "next/head";
import Image from "next/image";
import logo from "../../images/logo.png";
import Link from "next/link";

type Props = {
  tripInfo: TripInfo;
};

export enum TripStatus {
  Pending = "pending",
  Comfirmed = "comfirmed",
  StartedByHost = "startedByHost",
  Started = "started",
  FinishedByGuest = "finishedByGuest",
  Finished = "finished",
  Closed = "closed",
  Rejected = "rejected",
}

export type TripInfo = {
  tripId: number;
  carId: number;
  image: string;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  tripStart: string;
  tripEnd: string;
  locationStart: string;
  locationEnd: string;
  status: TripStatus;
};

export default function TripItem({ tripInfo }: Props) {
  const getButtonsFromStatus = (tripStatus: TripStatus) => {
    return (
      <>
        {tripStatus === TripStatus.Pending ? (
          <button className="px-4 w-full h-16 bg-violet-700 rounded-md">
            Confirm
          </button>
        ) : null}
        {tripStatus === TripStatus.Pending ? (
          <button className="px-4 w-full h-16 bg-violet-700 rounded-md">
            Reject
          </button>
        ) : null}
        {tripStatus === TripStatus.Comfirmed ? (
          <button className="px-4 w-full  h-16 bg-violet-700 rounded-md">
            Check-in
          </button>
        ) : null}
        {/* (tripStatus === TripStatus.StartedByHost) ? <button></button> : null */}
        {/* (tripStatus === TripStatus.Started) ? <button></button> : null */}
        {tripStatus === TripStatus.FinishedByGuest ? (
          <button className="px-4 w-full  h-16 bg-violet-700 rounded-md">
            Check-out
          </button>
        ) : null}
        {tripStatus === TripStatus.Finished ? (
          <button className="px-4 w-full  h-16 bg-violet-700 rounded-md">
            Report issue
          </button>
        ) : null}
        {/*         
        <button className="w-56 h-16 bg-violet-700 rounded-md">
              Add Listing
            </button> */}
        {/* (tripStatus === TripStatus.Closed) ? <button></button> : null */}
        {/* (tripStatus === TripStatus.Rejected) ? <button></button> : null */}
      </>
    );
  };

  return (
    <div className="flex flex-wrap rounded-xl bg-pink-100">
      <div className="w-60 h-56 bg-slate-400 rounded-l-xl flex-shrink-0">
        {/* <Image src={carInfo.image} alt="" width={240} height={192} className="w-60 h-48 rounded-lg object-cover" /> */}
        <img
          src={tripInfo.image}
          alt=""
          className="w-full h-full rounded-lg object-cover"
        />
      </div>
      <div className="flex flex-col flex-1 gap-2 p-4 justify-between">
        <div className="flex flex-col">
          <div>
            <strong className="text-xl">{`${tripInfo.brand} ${tripInfo.model} ${tripInfo.year}`}</strong>
          </div>
          <div>{tripInfo.licensePlate}</div>
        </div>
        <div className="flex flex-row gap-4">
          {getButtonsFromStatus(tripInfo.status)}
        </div>
      </div>
      <div className="flex flex-col flex-1 gap-2 p-4">
        <div className="flex flex-col">
          <div>
            <strong className="text-l">Trip start</strong>
          </div>
          <div className="whitespace-nowrap">{tripInfo.tripStart}</div>
          {/* <div>April 05, 4:00 AM</div> */}
        </div>
        <div className="flex flex-col">
          <div>
            <strong className="text-l">Trip end</strong>
          </div>
          <div className="whitespace-nowrap">{tripInfo.tripEnd}</div>
          {/* <div>April 05, 4:00 AM</div> */}
        </div>
      </div>
      <div className="flex flex-col flex-1 gap-2 p-4">
        <div className="flex flex-col">
          <div>
            <strong className="text-l whitespace-nowrap">Pickup location</strong>
          </div>
          <div>{tripInfo.locationStart}</div>
          {/* <div>Miami, CA, USA</div> */}
        </div>
        <div className="flex flex-col">
          <div>
            <strong className="text-l whitespace-nowrap">Return location</strong>
          </div>
          <div>{tripInfo.locationEnd}</div>
          {/* <div>Miami, CA, USA</div> */}
        </div>
      </div>
    </div>
  );
}
