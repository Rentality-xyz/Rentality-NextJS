import PageTitle from "../pageTitle/pageTitle";
import RntButton from "../common/rntButton";
import TripCard from "@/components/tripCard/tripCard";
import Image from "next/image";
import carDoorsIcon from "@/images/car_doors.png";
import carSeatsIcon from "@/images/car_seats.png";
import carEngineTypeIcon from "@/images/car_engine_type.png";
import carTransmissionIcon from "@/images/car_transmission.png";
import carTankSizeIcon from "@/images/car_tank_size.png";
import carColourIcon from "@/images/car_colour.png";
import { getEngineTypeString } from "@/model/EngineType";
import moment from "moment";
import RntContractModal from "@/components/common/rntContractModal";
import useTripInfo from "@/hooks/useTripInfo";
import { useRouter } from "next/router";
import { TFunction as TFunctionNext } from "i18next";
import { TFunction } from "@/utils/i18n";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { getRefuelValueAndCharge } from "@/model/TripInfo";

export default function TripInfo({ tripId, t }: { tripId: bigint; t: TFunctionNext }) {
  const [isLoading, tripInfo] = useTripInfo(tripId);
  const router = useRouter();
  const t_details: TFunction = (name, options) => {
    return t("booked.details." + name, options);
  };

  if (tripId == null || tripId === BigInt(0)) return null;
  const { refuelValue, refuelCharge } = getRefuelValueAndCharge(tripInfo, tripInfo.endFuelLevelInPercents);

  return (
    <>
      <PageTitle title={t_details("title", { tripId: tripId.toString() })} />
      {isLoading ? (
        <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
          {t("common.info.loading")}
        </div>
      ) : (
        <>
          <TripCard
            key={Number(tripId)}
            tripInfo={tripInfo}
            disableButton={true}
            isHost={false}
            showMoreInfo={false}
            t={t}
            changeStatusCallback={async (changeStatus: () => Promise<boolean>) => {}}
          />

          <div className="flex flex-wrap my-6">
            <div className="w-full xl:w-2/3">
              <div className="rnt-card flex flex-col rounded-xl bg-rentality-bg my-2 mr-2">
                <div className="flex flex-row grow p-2">
                  <strong className="text-2xl text-[#52D1C9]">{t_details("about_car")}</strong>
                </div>
                <div className="flex flex-row grow p-2">
                  <strong className="text-xl text-[#52D1C9]">{t_details("basic_car_details")}</strong>
                </div>
                <div className="flex flex-wrap p-2">
                  <div className="flex w-40 items-center m-2">
                    <Image className="me-1" src={carDoorsIcon} width={30} height={30} alt="" />
                    {tripInfo.carDoorsNumber} {t_details("doors")}
                  </div>
                  <div className="flex w-40 items-center m-2">
                    <Image className="me-1" src={carSeatsIcon} width={30} height={30} alt="" />
                    {tripInfo.carSeatsNumber} {t_details("seats")}
                  </div>
                  <div className="flex w-40 items-center m-2">
                    <Image className="me-1" src={carEngineTypeIcon} width={30} height={30} alt="" />
                    {t("vehicles.engine_type")} {getEngineTypeString(tripInfo.engineType)}
                  </div>
                  <div className="flex w-40 items-center m-2 word-break">
                    <Image className="me-1" src={carTransmissionIcon} width={30} height={30} alt="" />
                    {t("vehicles.transmission")}: {tripInfo.carTransmission}
                  </div>
                  <div className="flex w-40 items-center m-2">
                    <Image className="me-1" src={carTankSizeIcon} width={30} height={30} alt="" />
                    {t("vehicles.tank_size")}: {tripInfo.tankVolumeInGal}
                  </div>
                  <div className="flex w-40 items-center m-2">
                    <Image className="me-1" src={carColourIcon} width={30} height={30} alt="" />
                    {t_details("car_colour")}: {tripInfo.carColor}
                  </div>
                </div>
                <div className="flex flex-row grow p-2">
                  <strong className="text-xl text-[#52D1C9]">{t_details("more_car_details")}</strong>
                </div>
                <div className="flex-row grow p-2">{tripInfo.carDescription}</div>
              </div>
              <div className="rnt-card flex flex-col rounded-xl overflow-hidden bg-rentality-bg my-2 mr-2">
                <div className="flex flex-row grow p-2">
                  <strong className="text-2xl text-[#52D1C9]">{t_details("trip_status_details")}</strong>
                </div>
              </div>
            </div>
            <div className="w-full xl:w-1/3">
              <div className="rnt-card flex flex-col rounded-xl overflow-hidden bg-rentality-bg my-2 ml-2">
                <div className="flex flex-row grow p-2">
                  <strong className="text-2xl text-[#52D1C9]">{t_details("trip_receipt")}</strong>
                </div>
                <div className="flex flex-row grow p-2">
                  {t_details("reservation")} # {tripInfo.tripId}
                </div>
                <hr className="my-4" />
                <table className="m-2">
                  <tbody>
                    <tr>
                      <td>{t_details("price_per_day")}</td>
                      <td className="text-end">${displayMoneyWith2Digits(tripInfo.pricePerDayInUsd)}</td>
                    </tr>
                    <tr>
                      <td>{t_details("trip_days")}</td>
                      <td className="text-end">{moment(tripInfo.tripEnd).diff(tripInfo.tripStart, "days")}</td>
                    </tr>
                    <tr>
                      <td>{t_details("trip_price")}</td>
                      <td className="text-end">${displayMoneyWith2Digits(tripInfo.totalDayPriceInUsd)}</td>
                    </tr>
                    <tr>
                      <td>{t_details("discount_amount")}</td>
                      <td className="text-end text-red-500">
                        -${displayMoneyWith2Digits(tripInfo.totalDayPriceInUsd - tripInfo.totalPriceWithDiscountInUsd)}
                      </td>
                    </tr>
                    <tr>
                      <td>{t_details("sales_tax")}</td>
                      <td className="text-end">${tripInfo.taxPriceInUsd}</td>
                    </tr>
                    <tr>
                      <td>{t_details("government_tax")}</td>
                      <td className="text-end text-red-700">UNMAPPED</td>
                    </tr>
                    <tr>
                      <td className="pt-5">
                        <strong>{t_details("trip_total")}</strong>
                      </td>
                      <td className="text-end pt-5">
                        ${displayMoneyWith2Digits(tripInfo.totalPriceWithDiscountInUsd + tripInfo.taxPriceInUsd)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <hr className="my-4" />
                <div className="flex flex-row grow p-2">{t_details("security_deposit_info")}:</div>
                <table className="m-2">
                  <tbody>
                    <tr>
                      <td>{t_details("received")}</td>
                      <td className="text-end">${displayMoneyWith2Digits(tripInfo.depositInUsd)}</td>
                    </tr>
                    <tr>
                      <td>{t_details("reimbursement")}</td>
                      <td className="text-end text-red-500">
                        -${displayMoneyWith2Digits(tripInfo.resolveAmountInUsd)}
                      </td>
                    </tr>
                    <tr>
                      <td>{t_details("returned")}</td>
                      <td className="text-end">${displayMoneyWith2Digits(tripInfo.depositReturnedInUsd)}</td>
                    </tr>
                  </tbody>
                </table>
                <hr className="my-4" />
                <div className="flex flex-row grow p-2">{t_details("reimbursement_info")}:</div>
                <table className="m-2">
                  <tbody>
                    <tr>
                      <td>{t_details("refuel_gal")}</td>
                      <td className="text-end">{refuelValue}</td>
                    </tr>
                    <tr>
                      <td>{t_details("price_per_gal")}</td>
                      <td className="text-end">${displayMoneyWith2Digits(tripInfo.fuelPricePerGal)}</td>
                    </tr>
                    <tr>
                      <td>{t_details("refuel_or_recharge")}</td>
                      <td className="text-end">{refuelCharge}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="flex justify-center p-2">
                  <RntContractModal tripId={tripId} tripInfo={tripInfo} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-4 mb-8 mt-4 justify-center">
            <RntButton className="w-40 h-16" onClick={() => router.back()}>
              {t("common.back")}
            </RntButton>
          </div>
        </>
      )}
    </>
  );
}
