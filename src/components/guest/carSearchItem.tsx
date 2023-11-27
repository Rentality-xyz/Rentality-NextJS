import { SearchCarInfo } from "@/model/SearchCarsResult";
import RntButton from "../common/rntButton";
import { Avatar } from "@mui/material";

type Props = {
  searchInfo: SearchCarInfo;
  handleRentCarRequest: (carInfo: SearchCarInfo) => void;
  disableButton: boolean;
};

export default function CarSearchItem({ searchInfo, handleRentCarRequest, disableButton }: Props) {
  return (
    <div className="bg-rentality-bg rnt-card flex flex-col md:flex-row rounded-xl overflow-hidden">
      {/* <div className="w-60 h-full min-h-[14rem] flex-shrink-0">
        <Image
          src={searchInfo.image}
          alt=""
          width={1000}
          height={1000}
          className="h-full w-full object-cover"
        />
      </div> */}
      <div
        style={{ backgroundImage: `url(${searchInfo.image})` }}
        className="relative w-full md:w-64 min-h-[12rem] flex-shrink-0 bg-center bg-cover"
      />
      <div className="flex w-full flex-col justify-between p-4">
        <div className="flex flex-row items-baseline justify-between ">
          <div className="w-9/12 overflow-hidden">
            <strong className="text-lg overflow-hidden overflow-ellipsis">{`${searchInfo.brand} ${searchInfo.model} ${searchInfo.year}`}</strong>
          </div>
          <div>{searchInfo.licensePlate}</div>
        </div>
        <div className="flex md:grid md:grid-cols-[2fr_1fr] text-xs mt-2 md:justify-between">
          <div className="w-9/12 flex flex-col">
            <div>
              <strong>Total price ${searchInfo.totalPrice}</strong>
            </div>
            <div className="mt-2">
              <strong>{searchInfo.days} days</strong> trip for <strong>${searchInfo.pricePerDay} per day</strong>
            </div>
            <div>{searchInfo.milesIncludedPerDay} mi included per day</div>
            <div>Additionally security deposit ${searchInfo.securityDeposit} per trip</div>
          </div>
          <div className="flex flex-col">
            <div>- {searchInfo.fuelType}</div>
            <div>- {searchInfo.transmission}</div>
            <div>- {searchInfo.seatsNumber} seats</div>
          </div>
        </div>
        <div className="w-full grid grid-cols-[1fr_auto] items-end mt-2">
          <div className="flex flex-row items-center whitespace-nowrap overflow-hidden overflow-ellipsis">
            <div className="w-12 h-12 self-center mr-2">
              <Avatar src={searchInfo.hostPhotoUrl} sx={{ width: "3rem", height: "3rem" }}></Avatar>
            </div>
            <div className="flex flex-col">
              <p className="text-xs">HOSTED BY</p>
              <p className="text-sm">{searchInfo.hostName ?? "-"}</p>
            </div>
          </div>
          <RntButton
            className="h-14 w-44 text-base"
            onClick={() => handleRentCarRequest(searchInfo)}
            disabled={disableButton}
          >
            <div>Rent for {searchInfo.days} day(s)</div>
            <div>for ${searchInfo.totalPrice + searchInfo.securityDeposit}</div>
          </RntButton>
        </div>
      </div>
    </div>
  );
}
