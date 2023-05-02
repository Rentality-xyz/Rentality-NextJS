import Image from "next/image";

type Props = {
  carInfo: CarInfo;
};

export type CarInfo = {
  tokenId: number;
  owner: string;
  image: string;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  pricePerDay: number;
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
        <div className="flex flex-col">
          <strong className="text-xl">{`$${carInfo.pricePerDay}/day`}</strong>
          <div>{`$${carInfo.pricePerDay} est. total`}</div>
        </div>
      </div>
    </div>
  );
}
