import carDoorsIcon from "@/images/car_doors.svg";
import carSeatsIcon from "@/images/car_seats.svg";
import carTransmissionIcon from "@/images/car_transmission.svg";
import carTankSizeIcon from "@/images/car_tank_size.svg";
import carColourIcon from "@/images/car_colour.svg";
import { getEngineTypeIcon, getEngineTypeString } from "@/model/EngineType";
import { TripInfo } from "@/model/TripInfo";
import { TFunction } from "@/utils/i18n";
import Image from "next/image";
import React from "react";
import { useTranslation } from "react-i18next";

function TripAboutCar({ tripInfo }: { tripInfo: TripInfo }) {
  const { t } = useTranslation();

  const t_details: TFunction = (name, options) => {
    return t("booked.details." + name, options);
  };

  return (
    <div className="rnt-card my-2 flex flex-col rounded-xl bg-rentality-bg xl:mr-2">
      <div className="flex flex-col items-start justify-between p-2 sm:flex-row sm:items-center">
        <div>
          <strong className="text-2xl text-rentality-secondary">{t_details("about_car")}</strong>
        </div>
        <div className="max-sm:mt-2">VIN: {tripInfo.carVinNumber}</div>
      </div>
      <div className="flex grow flex-row p-2">
        <strong className="text-xl text-rentality-secondary">{t_details("basic_car_details")}</strong>
      </div>
      <div className="flex flex-wrap p-2 max-sm:flex-col">
        <div className="m-2 flex w-28 items-center">
          <Image className="me-1" src={carDoorsIcon} width={30} height={30} alt="" />
          {tripInfo.carDoorsNumber} {t_details("doors")}
        </div>
        <div className="m-2 flex w-28 items-center">
          <Image className="me-1" src={carSeatsIcon} width={30} height={30} alt="" />
          {tripInfo.carSeatsNumber} {t_details("seats")}
        </div>
        <div className="m-2 flex w-48 items-center">
          <Image className="me-1" src={getEngineTypeIcon(tripInfo.engineType)} width={50} height={30} alt="" />
          {t("vehicles.engine_type")} {getEngineTypeString(tripInfo.engineType)}
        </div>
        <div className="word-break m-2 flex w-40 items-center">
          <Image className="me-1" src={carTransmissionIcon} width={30} height={30} alt="" />
          {t("vehicles.transmission")}: {tripInfo.carTransmission}
        </div>
        <div className="m-2 flex w-44 items-center">
          <Image className="me-1" src={carTankSizeIcon} width={30} height={30} alt="" />
          {t("vehicles.tank_size")}: {tripInfo.tankVolumeInGal}
        </div>
        <div className="m-2 flex w-40 items-center">
          <Image className="me-1" src={carColourIcon} width={30} height={30} alt="" />
          {t_details("car_colour")}: {tripInfo.carColor}
        </div>
      </div>
      <div className="flex grow flex-row p-2">
        <strong className="text-xl text-rentality-secondary">{t_details("more_car_details")}</strong>
      </div>
      <div className="grow flex-row p-2">{tripInfo.carDescription}</div>
    </div>
  );
}

export default TripAboutCar;
