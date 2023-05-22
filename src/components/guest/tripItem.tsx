import Head from "next/head";
import Image from "next/image";
import logo from "../../images/logo.png";
import Link from "next/link";
import { dateFormat } from "@/utils/datetimeFormatters";

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
  tripStart: Date;
  tripEnd: Date;
  locationStart: string;
  locationEnd: string;
  status: TripStatus;
};

type Props = {
  tripInfo: TripInfo;
  finishTrip: (tripId:number) => void;
};

export default function TripItem({ tripInfo, finishTrip }: Props) {
  const getButtonsFromStatus = (tripId:number, tripStatus: TripStatus) => {
    return (
      <>
        {/* {tripStatus === TripStatus.Pending ? (
          <button className="h-16 w-full rounded-md bg-violet-700 px-4" onClick={() => {acceptRequest(tripId)}}>
            Confirm
          </button>
        ) : null}
        {tripStatus === TripStatus.Pending ? (
          <button className="h-16 w-full rounded-md bg-violet-700 px-4" onClick={() => {rejectRequest(tripId)}}>
            Reject
          </button>
        ) : null} */}
        {tripStatus === TripStatus.Comfirmed ? (
          <button className="h-16 w-full  rounded-md bg-violet-700 px-4" onClick={() => {finishTrip(tripId)}}>
            Finish trip{/* Check-in */}
          </button>
        ) : null}
        {/* (tripStatus === TripStatus.StartedByHost) ? <button></button> : null */}
        {/* (tripStatus === TripStatus.Started) ? <button></button> : null */}
        {tripStatus === TripStatus.FinishedByGuest ? (
          <button className="h-16 w-full  rounded-md bg-violet-700 px-4" onClick={() => {finishTrip(tripId)}}>
            Finish trip{/* Check-out */}
          </button>
        ) : null}
        {tripStatus === TripStatus.Finished ? (
          <button className="h-16 w-full  rounded-md bg-violet-700 px-4" onClick={() => {finishTrip(tripId)}}>
            Finish trip
          </button>
        ) : null}
        {/* {tripStatus === TripStatus.Closed ? (
          <button className="h-16 w-full  rounded-md bg-violet-700 px-4">
            Report issue
          </button>
        ) : null} */}
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
      <div className="h-56 w-60 flex-shrink-0 rounded-l-xl bg-slate-400 relative text-center">
        {/* <Image src={carInfo.image} alt="" width={240} height={192} className="w-60 h-48 rounded-lg object-cover" /> */}
        <img
          src={tripInfo.image}
          alt=""
          className="h-full w-full rounded-lg object-cover"
        />
        <div className="absolute top-4 right-8">
            <strong className="text-l">{`${tripInfo.status}`}</strong>
          </div>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2 p-4">
        <div className="flex flex-col">
          <div>
            <strong className="text-xl">{`${tripInfo.brand} ${tripInfo.model} ${tripInfo.year}`}</strong>
          </div>
          <div>{tripInfo.licensePlate}</div>
        </div>
        <div className="flex flex-row gap-4">
          {getButtonsFromStatus(tripInfo.tripId, tripInfo.status)}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-col">
          <div>
            <strong className="text-l">Trip start</strong>
          </div>
          <div className="whitespace-nowrap">
            {dateFormat(tripInfo.tripStart)}
          </div>
          {/* <div>April 05, 4:00 AM</div> */}
        </div>
        <div className="flex flex-col">
          <div>
            <strong className="text-l">Trip end</strong>
          </div>
          <div className="whitespace-nowrap">
            {dateFormat(tripInfo.tripEnd)}
          </div>
          {/* <div>April 05, 4:00 AM</div> */}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-col">
          <div>
            <strong className="text-l whitespace-nowrap">
              Pickup location
            </strong>
          </div>
          <div>{tripInfo.locationStart}</div>
          {/* <div>Miami, CA, USA</div> */}
        </div>
        <div className="flex flex-col">
          <div>
            <strong className="text-l whitespace-nowrap">
              Return location
            </strong>
          </div>
          <div>{tripInfo.locationEnd}</div>
          {/* <div>Miami, CA, USA</div> */}
        </div>
      </div>
    </div>
  );
}
