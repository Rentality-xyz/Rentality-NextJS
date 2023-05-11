import { CarInfo } from "@/model/CarInfo";
import Image from "next/image";

type Props = {
  carInfo: CarInfo;
};

export default function ListingItem({ carInfo }: Props) {
  return (
    <div className="flex flex-row rounded-xl bg-pink-100">
      <div className="w-60 h-56 bg-slate-400 rounded-l-xl flex-shrink-0">
        {/* <Image src={carInfo.image} alt="" width={240} height={192} className="w-60 h-48 rounded-lg object-cover" /> */}
        <img
          src={carInfo.image}
          alt=""
          className="w-full h-full rounded-lg object-cover"
        />
      </div>
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
          <div className="text-gray-600">Listing</div>
        </div>
      </div>
    </div>
  );
}
