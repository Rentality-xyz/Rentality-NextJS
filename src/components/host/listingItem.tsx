import { BaseCarInfo } from "@/model/BaseCarInfo";
import Image from "next/image";
import RntButton from "../common/rntButton";
import Link from "next/link";

type Props = {
  carInfo: BaseCarInfo;
};

export default function ListingItem({ carInfo }: Props) {
  return (
    <div className="bg-rentality-bg rnt-card flex flex-col sm_inverted:flex-row rounded-xl overflow-hidden">
      {/* <div className="w-60 h-56 flex-shrink-0">
        <Image
          src={carInfo.image}
          alt=""
          width={1000}
          height={1000}
          className="h-full w-full object-cover"
        />
      </div> */}
      <div
        style={{ backgroundImage: `url(${carInfo.image})` }}
        className="relative w-full sm_inverted:w-64 min-h-[12rem] flex-shrink-0 bg-center bg-cover"
      />
      <div className="w-full flex flex-col justify-between p-4">
        <div className="flex flex-row justify-between items-baseline">
          <div>
            <strong className="text-xl">{`${carInfo.brand} ${carInfo.model} ${carInfo.year}`}</strong>
          </div>
          <div>{carInfo.licensePlate}</div>
        </div>
        <div className="flex flex-row justify-between items-end">
          <div className="flex flex-col">
            <strong className="text-xl">{`$${carInfo.pricePerDay}/day`}</strong>
            <div className="text-sm">{`$${carInfo.pricePerDay} est. total`}</div>
          </div>
          <Link href={`/host/vehicles/edit/${carInfo.carId}`}>
            <RntButton className="w-28 h-12">Edit</RntButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
