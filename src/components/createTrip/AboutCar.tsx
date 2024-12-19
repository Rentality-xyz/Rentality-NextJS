import { getEngineTypeIcon, getEngineTypeString } from "@/model/EngineType";
import { AboutCarIcon } from "./AboutCarIcon";
import { useTranslation } from "react-i18next";
import { TransmissionType } from "@/model/Transmission";
import { EngineType } from "@/model/blockchain/schemas";
import carDoorsIcon from "@/images/car_doors.svg";
import carSeatsIcon from "@/images/car_seats.svg";
import carTransmissionIcon from "@/images/car_transmission.svg";
import carTankSizeIcon from "@/images/car_tank_size.svg";
import carColourIcon from "@/images/car_colour.svg";

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
