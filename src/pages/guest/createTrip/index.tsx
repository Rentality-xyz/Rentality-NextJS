import RntButton from "@/components/common/rntButton";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import { getEngineTypeIcon, getEngineTypeString } from "@/model/EngineType";
import Image from "next/image";
import carDoorsIcon from "@/images/car_doors.svg";
import carSeatsIcon from "@/images/car_seats.svg";
import carTransmissionIcon from "@/images/car_transmission.svg";
import carTankSizeIcon from "@/images/car_tank_size.svg";
import carColourIcon from "@/images/car_colour.svg";
import { EngineType } from "@/model/blockchain/schemas";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import { Avatar } from "@mui/material";
import { TransmissionType } from "@/model/Transmission";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { cn } from "@/utils";

export default function GuestTripDetails() {
  const carPhotos = [
    "https://ipfs.io/ipfs/QmVCNtikLRN6RaTmvuJzhDK2zgKkTjN9KrxNQeqg8FuSLt",
    "https://ipfs.io/ipfs/Qmf1r76PBcFwGoM72zfAUBey8Cz3oA1LcNsYWoT5m7a2dA",
    "https://ipfs.io/ipfs/QmPgVo39sEfXbcNhTtwmrm9v1jssH9itbz5oLQ3PegeikJ",
    "https://ipfs.io/ipfs/QmTuqxnthYj86wYDfTy5xvHfweY8UMGAiKahgwYbcgjEQp",
    "https://ipfs.io/ipfs/QmfGxQc4yn1zt7GLfqZmWdwEWDakhmY66y7hYgGXgNqUQD",
    "https://ipfs.io/ipfs/QmXvV9BBZrsT6HfMj2VPA3YqmiNZvwX1ZhNSNWygKB4KmC",
    "https://ipfs.io/ipfs/QmbUoCZoFJ5MgDxa1xC2n9JaJqyoYQduTBuHS1z2mt2VHg",
    "https://ipfs.io/ipfs/QmWeUrUEdbhug2SQFnRhXEMcfVL1smAxGvhMRN9x1AxyrQ",
    "https://ipfs.io/ipfs/QmPEng43fAqKgpu2fy7HB2BUgGEHFma8LBqzdZyx6c21aX",
    "https://ipfs.io/ipfs/QmVP9AL5di5yDRWaX7dVAnvc7NXXkvvMrNZS942XfnbH3m",
  ];

  function handleBackToSearchClick() {
    alert("TODO back to search");
  }

  return (
    <div className="grid grid-cols-[3fr_1fr] gap-4">
      <div className="flex flex-col gap-4">
        <CarPhotos carPhotos={carPhotos.slice(0, 1)} />
        <CarPhotos carPhotos={carPhotos.slice(0, 2)} />
        <CarPhotos carPhotos={carPhotos.slice(0, 3)} />
        <CarPhotos carPhotos={carPhotos.slice(0, 4)} />
        <CarPhotos carPhotos={carPhotos.slice(0, 5)} />
        <CarPhotos carPhotos={carPhotos.slice(0, 6)} />
        <CarPhotos carPhotos={carPhotos.slice(0, 7)} />
        <CarTitleAndPrices carTitle="Ferrari F8 2024" pricePerDay={100} discountPerDay={2} tripDays={3} />
        <AboutCar
          carName="Kirill`s Ferrari F8"
          doorsNumber={4}
          seatsNumber={5}
          engineType={EngineType.PETROL}
          transmission="Automatic"
          tankSizeInGal={19}
          carColor="White"
          carDescription="123456789frg sdg rga 4ta4 g dfg sepug mst8s 9b6tfbig fa89fu 08fawlfal"
        />
        <hr />
        <TripConditions />
        <hr />
        <CreateTripDiscounts />
        <hr />
        <div className="grid w-full grid-cols-2 gap-8">
          <RntButtonTransparent className="w-full text-lg text-rentality-secondary">Trip Rules</RntButtonTransparent>
          <RntButtonTransparent className="w-full text-lg text-rentality-secondary">
            Pre-agreement details
          </RntButtonTransparent>
        </div>
        <CreateTripHostedBy />
      </div>
      <div className="flex flex-col">
        <div className="mx-auto font-bold text-rentality-secondary" onClick={handleBackToSearchClick}>
          ← New Search{" "}
        </div>
        <CreateTripSearch />
        <CreateTripGuestInsurance />
        <PreReceiptDetails />
        <RntButton className="h-16 w-full">Rent for 3 day(s)</RntButton>
      </div>
    </div>
  );
}

export function CarPhotos({ carPhotos }: { carPhotos: string[] }) {
  function handleAllPhotoClick() {
    alert("TODO back to search");
  }

  return (
    <div className="relative mx-auto my-20 h-[20rem] w-full">
      <CarPhotosLayout carPhotos={carPhotos} />
      <RntButton className="absolute bottom-2 right-4 h-10 w-fit px-2" onClick={handleAllPhotoClick}>
        {carPhotos.length > 6 ? `All ${carPhotos.length} photo` : "See in full"}
      </RntButton>
    </div>
  );
}

export function CarPhotosLayout({ carPhotos }: { carPhotos: string[] }) {
  if (carPhotos.length <= 1) return <CarPhoto carImageUrl={carPhotos[0]} />;
  if (carPhotos.length === 2)
    return (
      <div className="grid h-full w-full grid-cols-[3fr_2fr]">
        <CarPhoto carImageUrl={carPhotos[0]} />
        <CarPhoto carImageUrl={carPhotos[1]} />
      </div>
    );
  if (carPhotos.length === 3)
    return (
      <div className="grid h-full w-full grid-cols-[3fr_2fr]">
        <CarPhoto carImageUrl={carPhotos[0]} />
        <div className="grid grid-rows-[1fr_1fr]">
          <CarPhoto carImageUrl={carPhotos[1]} />
          <CarPhoto carImageUrl={carPhotos[2]} />
        </div>
      </div>
    );
  if (carPhotos.length === 4)
    return (
      <div className="grid h-full w-full grid-cols-[3fr_2fr]">
        <CarPhoto carImageUrl={carPhotos[0]} />
        <div className="grid grid-rows-[3fr_2fr]">
          <CarPhoto carImageUrl={carPhotos[1]} />
          <div className="grid grid-cols-2">
            <CarPhoto carImageUrl={carPhotos[2]} />
            <CarPhoto carImageUrl={carPhotos[3]} />
          </div>
        </div>
      </div>
    );

  return (
    <div className="grid h-full w-full grid-cols-[3fr_2fr]">
      <CarPhoto carImageUrl={carPhotos[0]} />
      <div className="grid grid-rows-[3fr_2fr]">
        <div className={cn("grid", carPhotos.length > 4 ? "grid-cols-2" : "")}>
          {carPhotos[1] && <CarPhoto carImageUrl={carPhotos[1]} />}
          {carPhotos[4] && <CarPhoto carImageUrl={carPhotos[4]} />}
        </div>
        <div className={cn("grid", carPhotos.length > 5 ? "grid-cols-3" : carPhotos.length > 3 ? "grid-cols-2" : "")}>
          {carPhotos[2] && <CarPhoto carImageUrl={carPhotos[2]} />}
          {carPhotos[3] && <CarPhoto carImageUrl={carPhotos[3]} />}
          {carPhotos[5] && <CarPhoto carImageUrl={carPhotos[5]} />}
        </div>
      </div>
    </div>
  );
}

export function CarPhoto({ carImageUrl }: { carImageUrl: string }) {
  return (
    <Image
      src={carImageUrl}
      alt=""
      width={1000}
      height={1000}
      className="h-full max-h-[20rem] w-full border-[1px] border-white bg-gray-500 object-cover object-center"
    />
  );
}

export function CarTitleAndPrices({
  carTitle,
  pricePerDay,
  discountPerDay = 0,
  tripDays,
}: {
  carTitle: string;
  pricePerDay: number;
  discountPerDay: number;
  tripDays: number;
}) {
  return (
    <div className="flex flex-row items-center justify-between">
      <h1 className="text-3xl">
        <strong>{carTitle}</strong>
      </h1>
      <span className="flex">
        <span className="text-2xl text-gray-500">
          <s>${displayMoneyWith2Digits(pricePerDay)}</s>
        </span>
        <span className="text-3xl">${displayMoneyWith2Digits(pricePerDay - discountPerDay)}/day</span>
      </span>

      <span className="flex flex-col items-end text-rentality-secondary">
        <p>{tripDays} day discount</p>
        <p>${displayMoneyWith2Digits(discountPerDay * tripDays)}/trip</p>
      </span>
    </div>
  );
}

export function AboutCar({
  carName,
  doorsNumber,
  seatsNumber,
  engineType,
  transmission,
  tankSizeInGal,
  carColor,
  carDescription,
}: {
  carName: string;
  doorsNumber: number;
  seatsNumber: number;
  engineType: EngineType;
  transmission: TransmissionType;
  tankSizeInGal: number;
  carColor: string;
  carDescription: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-rentality-bg p-4">
      <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
        <h2>
          <strong className="text-2xl text-rentality-secondary">{t("booked.details.about_car")}</strong>
        </h2>
        <div className="max-sm:mt-2 lg:mr-12">{carName}</div>
      </div>
      <div className="flex flex-col gap-4">
        <h3>
          <strong className="text-xl text-rentality-secondary">{t("booked.details.basic_car_details")}</strong>
        </h3>
        <div className="flex flex-wrap gap-8 max-sm:flex-col">
          <AboutCarIcon image={carDoorsIcon} text={`${doorsNumber} ${t("booked.details.doors")}`} />
          <AboutCarIcon image={carSeatsIcon} text={`${seatsNumber} ${t("booked.details.seats")}`} />
          <AboutCarIcon
            image={getEngineTypeIcon(engineType)}
            width={50}
            title={t("vehicles.engine_type")}
            text={getEngineTypeString(engineType)}
          />
          <AboutCarIcon image={carTransmissionIcon} title={t("vehicles.transmission")} text={transmission} />
          <AboutCarIcon image={carTankSizeIcon} title={t("vehicles.tank_size")} text={tankSizeInGal} />
          <AboutCarIcon image={carColourIcon} title={t("booked.details.car_colour")} text={carColor} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3>
          <strong className="text-xl text-rentality-secondary">{t("booked.details.more_car_details")}</strong>
        </h3>
        <p>{carDescription}</p>
      </div>
    </div>
  );
}

export function AboutCarIcon({
  image,
  width,
  height,
  title,
  text,
}: {
  image: string;
  width?: number;
  height?: number;
  title?: string;
  text?: string | number;
}) {
  return (
    <div className="flex items-center gap-1">
      <Image className="me-1" src={image} width={width ?? 30} height={height ?? 30} alt="" />
      <div className="flex flex-col">
        {title && <p>{title}:</p>}
        <p>{text}</p>
      </div>
    </div>
  );
}

export function TripConditions() {
  return (
    <div className="flex flex-col">
      <h3>Trip conditions</h3>
      <p>
        <span className="text-rentality-secondary">Insurance:</span>extra insurance not required
      </p>
      <p>
        <span className="text-rentality-secondary">Price:</span>$100.00/day
      </p>
      <p>
        <span className="text-rentality-secondary">Security deposit:</span>100.00/trip
      </p>
      <p>
        <span className="text-rentality-secondary">Daily mileage:</span>100 ml
      </p>
      <p>
        <span className="text-rentality-secondary">Price per overmile:</span>$1.00
      </p>
      <p>
        <span className="text-rentality-secondary">Price per 10% charge/tank:</span>$5.00
      </p>
      <p>
        <span className="text-rentality-secondary">Delivery fee:</span>from 1 to 25 mile $3.00 per mile, over 25 miles
        $2.50 per mile
      </p>
      <p>
        <span className="text-rentality-secondary">Cancellation:</span>free cancellation before the trip started
      </p>
      <p>
        <span className="text-rentality-secondary">Taxes:</span>Sales and Government Tax will be added
      </p>
    </div>
  );
}

export function CreateTripDiscounts() {
  return (
    <div className="flex flex-col">
      <h3>Discounts:</h3>
      <p>
        <span className="text-rentality-secondary">3+ day discount:</span> 10%
      </p>
      <p>
        <span className="text-rentality-secondary">7+ day discount:</span>15%
      </p>
      <p>
        <span className="text-rentality-secondary">30+ day discount:</span>30%
      </p>
    </div>
  );
}

export function CreateTripHostedBy() {
  return (
    <div className="flex flex-row">
      <div className="bg-rentality-bg p-4">
        <div className="h-12 w-12 self-center">
          <Avatar src={carTankSizeIcon} sx={{ width: "3rem", height: "3rem" }}></Avatar>
        </div>
      </div>
      <div className="flex flex-col">
        <p>HOSTED BY Svitlana</p>
        <p>Miami, Florida, US</p>
        <p className="text-sm text-gray-500">Contacts, full address and vehicle data available after booking</p>
      </div>
    </div>
  );
}

export function CreateTripSearch() {
  return (
    <div className="grid grid-cols-2">
      <div className="flex flex-col items-center">
        <p className="text-rentality-secondary">Trip start</p>
        <p>August 22, 9:00 AM</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-rentality-secondary">Trip end</p>
        <p>August 25, 9:00 AM</p>
      </div>
      <hr className="col-span-2" />
      <div className="flex flex-col items-center">
        <p className="text-rentality-secondary">Pickup location</p>
        <p>824 S Miami Ave, Miami, Florida, US</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-rentality-secondary">Return location</p>
        <p>Miami, Florida, US</p>
        <p className="text-xs">Full host address available after booking</p>
      </div>
      <hr className="col-span-2" />
      <div className="col-span-2 mx-auto text-rentality-secondary">Delivery</div>
      <div className="flex flex-col items-center">
        <p className="text-rentality-secondary">Deliver to guest</p>
        <p>10 miles to Pick-Up location $30.00</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-rentality-secondary">Host home location</p>
        <p>delivery free</p>
      </div>
      <hr className="col-span-2" />
    </div>
  );
}

export function CreateTripGuestInsurance() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        <span className="text-rentality-secondary">Guest insurance </span>
        <i>i</i>
      </div>
      <p>Extra insurance not required</p>
    </div>
  );
}

export function PreReceiptDetails() {
  return (
    <div className="grid grid-cols-2 bg-rentality-bg">
      <h3 className="col-span-2 text-rentality-secondary">See trip pre-receipt details</h3>
      <hr className="col-span-2" />
      <p>Price per day</p>
      <p>$60.00</p>

      <p>Trip days</p>
      <p>3</p>

      <p>Trip price</p>
      <p>$180.00</p>

      <p>Discount Amount</p>
      <p className="text-red-500">-$3.60</p>

      <p>Delivery fee to Pick-Up location</p>
      <p>$105.00</p>

      <p>Delivery fee from Drop-Off location</p>
      <p>$0.00</p>

      <p>Sales Tax</p>
      <p>$19.69</p>

      <p>Government Tax</p>
      <p>$6</p>
      <p>Total charge</p>
      <p>$307.09</p>

      <hr className="col-span-2" />
      <p>Security deposit</p>
      <p>$100.00</p>

      <hr className="col-span-2" />
      <p>Total payable</p>
      <p>$482.09</p>

      <hr className="col-span-2" />
    </div>
  );
}
